import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { type?: string };

    const validTypes = ["answer_text", "answer_photo", "cookie_accept", "cookie_decline"];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Неверный тип согласия." }, { status: 400 });
    }

    // Пробуем получить пользователя, но не требуем авторизации
    let userId: string | null = null;
    try {
      const user = await getCurrentUser();
      userId = user?.id ?? null;
    } catch {
      // анонимный пользователь — нормально
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;

    const userAgent = request.headers.get("user-agent") ?? null;

    await prisma.consent.create({
      data: {
        type: body.type,
        userId: userId ?? undefined,
        ip: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[consents]", err);
    return NextResponse.json({ error: "Ошибка сервера." }, { status: 500 });
  }
}
