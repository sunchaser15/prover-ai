import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

async function readLoginBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as LoginBody;
    return { body, isJson: true };
  }

  const formData = await request.formData();
  return {
    body: {
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    },
    isJson: false,
  };
}

function redirectToLogin(request: Request, error: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export async function POST(request: Request) {
  const { body, isJson } = await readLoginBody(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    const error = "Введите почту и пароль.";
    return isJson
      ? NextResponse.json({ error }, { status: 400 })
      : redirectToLogin(request, "missing");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = "Неправильная почта или пароль.";
    return isJson
      ? NextResponse.json({ error }, { status: 401 })
      : redirectToLogin(request, "invalid");
  }

  await setSession(user.id);

  if (!isJson) {
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
