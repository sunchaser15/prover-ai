import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/app/components/auth-form";
import { PageShell } from "@/app/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-6 text-center text-sm font-medium text-white/65">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-black text-[#7CFF8A]">
          Бесплатная регистрация
        </Link>
      </p>
    </PageShell>
  );
}
