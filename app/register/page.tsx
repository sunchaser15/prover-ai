import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/app/components/auth-form";
import { PageShell } from "@/app/components/page-shell";

export default function RegisterPage() {
  return (
    <PageShell>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
      <p className="mt-6 text-center text-sm font-medium text-white/65">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-black text-[#7CFF8A]">
          Войти
        </Link>
      </p>
    </PageShell>
  );
}
