import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/components/logout-button";
import { PageShell } from "@/app/components/page-shell";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
              Личный кабинет
            </p>
            <h1 className="text-5xl font-black uppercase text-white md:text-7xl">
              Ваши проверки
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-white/70">
              Отправляйте работы, смотрите баллы и возвращайтесь к рекомендациям.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/new"
              className="animated-gradient-button rounded-md px-5 py-3 text-sm font-black uppercase text-white"
            >
              Новая проверка
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/dashboard/submissions/${submission.id}`}
              className="glass-card block p-5 transition-transform hover:-translate-y-1"
            >
              <p className="text-sm font-bold uppercase text-white/55">
                {submission.subject.title}
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase text-white">
                {submission.title}
              </h2>
              <strong className="mt-5 block text-4xl font-black text-[#7CFF8A]">
                {submission.score}/{submission.maxScore}
              </strong>
            </Link>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="glass-card p-6 text-white/72">
            Пока нет работ. Начните с первой проверки.
          </div>
        )}
      </div>
    </PageShell>
  );
}
