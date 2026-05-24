import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/app/components/page-shell";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const submission = await prisma.submission.findFirst({
    where: { id, userId: user.id },
    include: { subject: true, checkResult: true },
  });

  if (!submission) {
    notFound();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-black text-[#7CFF8A]">
          ← Назад к работам
        </Link>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <article className="glass-card p-6">
            <p className="text-sm font-bold uppercase text-white/55">
              {submission.subject.title}
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase text-white">
              {submission.title}
            </h1>
            <strong className="mt-6 block text-6xl font-black text-[#7CFF8A]">
              {submission.score}/{submission.maxScore}
            </strong>
          </article>
          <article className="glass-card p-6">
            <h2 className="text-2xl font-black uppercase text-white">Разбор</h2>
            <div className="mt-5 grid gap-3">
              <p className="rounded-md border border-[#7CFF8A]/35 bg-[#7CFF8A]/10 p-4 text-white/78">
                <strong className="text-[#7CFF8A]">Сильные стороны: </strong>
                {submission.checkResult?.strengths}
              </p>
              <p className="rounded-md border border-[#7CFF8A]/35 bg-[#7CFF8A]/10 p-4 text-white/78">
                <strong className="text-[#7CFF8A]">Что улучшить: </strong>
                {submission.checkResult?.improvements}
              </p>
              <p className="rounded-md border border-[#FF4D5E]/35 bg-[#FF4D5E]/10 p-4 text-white/78">
                <strong className="text-[#FF9AA4]">Ошибки: </strong>
                {submission.checkResult?.mistakes}
              </p>
              <p className="rounded-md border border-white/12 bg-white/7 p-4 text-white/78">
                <strong className="text-[#00FFD7]">Рекомендация: </strong>
                {submission.checkResult?.recommendation}
              </p>
            </div>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
