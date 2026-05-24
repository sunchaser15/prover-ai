import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { id } = await params;
    const submission = await prisma.submission.findFirst({
      where: { id, userId: user.id },
      include: { subject: true, checkResult: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Работа не найдена." }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: "Не авторизован." }, { status: 401 });
  }
}
