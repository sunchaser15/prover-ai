import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/components/logout-button";
import { PageShell } from "@/app/components/page-shell";
import { DashboardClient } from "@/app/components/dashboard-client";
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

  // Сериализуем даты в строки для клиента
  const serialized = submissions.map((s) => ({
    id: s.id,
    title: s.title,
    score: s.score,
    maxScore: s.maxScore,
    createdAt: s.createdAt.toISOString(),
    subject: { id: s.subject.id, title: s.subject.title },
  }));

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

        <DashboardClient submissions={serialized} />
      </div>
    </PageShell>
  );
}
