import { ArrowRight, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/app/components/page-shell";

const examples = [
  {
    subject: "Русский язык",
    score: "24/24",
    text: "Тезис раскрыт, аргументы связаны с проблемой, речевых ошибок нет.",
  },
  {
    subject: "Биология",
    score: "21/24",
    text: "Хорошая терминология, но один процесс требует более точного пояснения.",
  },
  {
    subject: "Обществознание",
    score: "22/24",
    text: "План логичен, примеры стоит сделать более конкретными.",
  },
];

export default function ExamplesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
          Примеры проверок
        </p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="max-w-4xl text-5xl font-black uppercase text-white md:text-7xl">
            Как выглядит разбор ответа
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row lg:pb-2">
            <Link
              href="/dashboard/new"
              className="animated-gradient-button inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 text-sm font-black uppercase text-white"
            >
              <FileCheck2 size={18} />
              Новая проверка
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/8 px-6 py-4 text-sm font-black uppercase text-white backdrop-blur-xl transition-colors hover:bg-white/15"
            >
              Попробовать бесплатно
              <ArrowRight size={18} className="text-[#BAFF72]" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <article key={example.subject} className="glass-card p-6">
              <p className="text-sm font-bold uppercase text-white/55">
                {example.subject}
              </p>
              <strong className="mt-4 block text-5xl font-black text-[#7CFF8A]">
                {example.score}
              </strong>
              <p className="mt-4 text-base font-medium leading-7 text-white/70">
                {example.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
