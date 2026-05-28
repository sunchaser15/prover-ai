import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/app/lib/auth";
import { createMockCheck } from "@/app/lib/mock-check";
import { createAiCheck, AI_SUPPORTED_SUBJECTS, type AiInputImage } from "@/app/lib/ai-check";
import { prisma } from "@/app/lib/prisma";

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_DATA_URL_LENGTH = 6_000_000;

function parseImages(images: unknown): AiInputImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.slice(0, MAX_IMAGE_COUNT).flatMap((image) => {
    if (!image || typeof image !== "object") {
      return [];
    }

    const candidate = image as Partial<AiInputImage>;
    if (
      typeof candidate.dataUrl !== "string" ||
      typeof candidate.mimeType !== "string" ||
      !candidate.mimeType.startsWith("image/") ||
      !candidate.dataUrl.startsWith(`data:${candidate.mimeType};base64,`) ||
      candidate.dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH
    ) {
      return [];
    }

    return [{
      name: typeof candidate.name === "string" ? candidate.name : undefined,
      mimeType: candidate.mimeType,
      dataUrl: candidate.dataUrl,
    }];
  });
}

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      include: { subject: true, checkResult: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Не авторизован." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as {
      subjectId?: string;
      title?: string;
      taskNumber?: string;
      taskType?: string;
      answer?: string;
      images?: unknown;
    };

    if (!body.subjectId || !body.title?.trim() || !body.answer?.trim()) {
      return NextResponse.json(
        { error: "Выберите предмет, заполните название и добавьте ответ." },
        { status: 400 }
      );
    }

    // Получаем slug предмета
    const subject = await prisma.subject.findUnique({ where: { id: body.subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "Предмет не найден." }, { status: 400 });
    }

    const taskType = body.taskType ?? body.taskNumber ?? "";
    const answer = body.answer.trim();
    const images = parseImages(body.images);

    let checkData: {
      score: number;
      maxScore: number;
      strengths: string;
      improvements: string;
      mistakes: string;
      recommendation: string;
      criteriaScores?: unknown;
      highlights?: unknown;
    };

    if (AI_SUPPORTED_SUBJECTS.includes(subject.slug) && taskType) {
      try {
        const aiResult = await createAiCheck({
          subjectSlug: subject.slug,
          taskType,
          answer,
          images,
        });
        checkData = {
          score: aiResult.score,
          maxScore: aiResult.maxScore,
          strengths: aiResult.strengths,
          improvements: aiResult.improvements,
          mistakes: aiResult.mistakes,
          recommendation: aiResult.recommendation,
          criteriaScores: aiResult.criteriaScores,
          highlights: aiResult.highlights,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const isQuotaError =
          message.includes("429") ||
          message.includes("quota") ||
          message.includes("RESOURCE_EXHAUSTED") ||
          message.includes("rate limit");

        console.warn(
          `[AI check fallback] subject=${subject.slug} taskType=${taskType} reason=${message}`
        );

        if (!isQuotaError && process.env.NODE_ENV === "production") {
          throw err;
        }

        checkData = createMockCheck(answer);
      }
    } else {
      const mock = createMockCheck(answer);
      checkData = mock;
    }

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        subjectId: body.subjectId,
        title: body.title.trim(),
        answer,
        taskType,
        score: checkData.score,
        maxScore: checkData.maxScore,
        checkResult: {
          create: {
            strengths: checkData.strengths,
            improvements: checkData.improvements,
            mistakes: checkData.mistakes,
            recommendation: checkData.recommendation,
            criteriaScores: checkData.criteriaScores ?? undefined,
            highlights: checkData.highlights ?? undefined,
          },
        },
      },
      include: { checkResult: true, subject: true },
    });

    return NextResponse.json({ submission });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
