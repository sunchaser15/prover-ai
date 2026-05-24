import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

async function readRegisterBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as RegisterBody;
    return { body, isJson: true };
  }

  const formData = await request.formData();
  return {
    body: {
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    },
    isJson: false,
  };
}

function redirectToRegister(request: Request, error: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/register", request.url), {
    status: 303,
  });
}

export async function POST(request: Request) {
  const { body, isJson } = await readRegisterBody(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || password.length < 8) {
    const error = "Введите email и пароль не короче 8 символов.";
    return isJson
      ? NextResponse.json({ error }, { status: 400 })
      : redirectToRegister(request, "invalid");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = "Пользователь с таким email уже существует.";
    return isJson
      ? NextResponse.json({ error }, { status: 409 })
      : redirectToRegister(request, "exists");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: body.name?.trim() || null,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  await setSession(user.id);

  if (!isJson) {
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
