import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/app/lib/auth";
import { createMockCheck } from "@/app/lib/mock-check";
import { prisma } from "@/app/lib/prisma";

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
      answer?: string;
    };

    if (!body.subjectId || !body.title?.trim() || !body.taskNumber?.trim() || !body.answer?.trim()) {
      return NextResponse.json(
        { error: "Выберите предмет, заполните название, номер задания и добавьте ответ." },
        { status: 400 }
      );
    }

    const check = createMockCheck(body.answer);
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        subjectId: body.subjectId,
        title: `${body.taskNumber?.trim()} — ${body.title?.trim()}`,
        answer: body.answer.trim(),
        score: check.score,
        maxScore: check.maxScore,
        checkResult: {
          create: {
            strengths: check.strengths,
            improvements: check.improvements,
            mistakes: check.mistakes,
            recommendation: check.recommendation,
          },
        },
      },
      include: { checkResult: true, subject: true },
    });

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: "Не авторизован." }, { status: 401 });
  }
}
