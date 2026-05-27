import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/app/components/page-shell";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { CriterionScore, Highlight } from "@/app/lib/ai-check";

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

  const criteria = submission.checkResult?.criteriaScores as CriterionScore[] | null;
  const highlights = submission.checkResult?.highlights as Highlight[] | null;

  const pct = submission.maxScore > 0
    ? Math.round((submission.score / submission.maxScore) * 100)
    : 0;

  const scoreColor =
    pct >= 75 ? "#7CFF8A" : pct >= 50 ? "#FFD166" : "#FF4D5E";

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-black text-[#7CFF8A]">
          ← Назад к работам
        </Link>

        {/* Шапка */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="glass-card p-6">
            <p className="text-sm font-bold uppercase text-white/55">
              {submission.subject.title}
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase text-white leading-tight">
              {submission.title}
            </h1>
            <div className="mt-6 flex items-end gap-3">
              <strong className="text-7xl font-black" style={{ color: scoreColor }}>
                {submission.score}
              </strong>
              <span className="mb-2 text-2xl font-bold text-white/40">
                /{submission.maxScore}
              </span>
            </div>
            {/* Прогресс-бар */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: scoreColor }}
              />
            </div>
            <p className="mt-1 text-xs text-white/40">{pct}% от максимума</p>
          </article>

          {/* Итог */}
          <article className="glass-card p-6">
            <h2 className="text-lg font-black uppercase text-white">Итог</h2>
            <div className="mt-4 grid gap-3">
              <p className="rounded-md border border-[#7CFF8A]/35 bg-[#7CFF8A]/10 p-3 text-sm text-white/80">
                <strong className="text-[#7CFF8A]">Сильные стороны: </strong>
                {submission.checkResult?.strengths}
              </p>
              <p className="rounded-md border border-[#FFD166]/35 bg-[#FFD166]/10 p-3 text-sm text-white/80">
                <strong className="text-[#FFD166]">Что улучшить: </strong>
                {submission.checkResult?.improvements}
              </p>
              <p className="rounded-md border border-[#FF4D5E]/35 bg-[#FF4D5E]/10 p-3 text-sm text-white/80">
                <strong className="text-[#FF9AA4]">Ошибки: </strong>
                {submission.checkResult?.mistakes}
              </p>
              <p className="rounded-md border border-white/12 bg-white/7 p-3 text-sm text-white/80">
                <strong className="text-[#00FFD7]">Рекомендация: </strong>
                {submission.checkResult?.recommendation}
              </p>
            </div>
          </article>
        </div>

        {/* Разбалловка по критериям */}
        {criteria && criteria.length > 0 && (
          <section className="glass-card mt-4 p-6">
            <h2 className="text-xl font-black uppercase text-white">
              Разбалловка по критериям
            </h2>
            <div className="mt-4 grid gap-3">
              {criteria.map((c) => {
                const cPct = c.max > 0 ? Math.round((c.score / c.max) * 100) : 0;
                const cColor =
                  cPct >= 75 ? "#7CFF8A" : cPct >= 40 ? "#FFD166" : "#FF4D5E";
                return (
                  <div
                    key={c.code}
                    className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded px-2 py-0.5 text-xs font-black"
                          style={{ background: cColor + "20", color: cColor }}
                        >
                          {c.code}
                        </span>
                        <span className="text-sm font-bold text-white/80">{c.name}</span>
                      </div>
                      <p className="mt-1 text-xs text-white/50">{c.comment}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cPct}%`, background: cColor }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-black" style={{ color: cColor }}>
                        {c.score}/{c.max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Текст работы с подсветкой */}
        {highlights && highlights.length > 0 && submission.answer && (
          <section className="glass-card mt-4 p-6">
            <h2 className="text-xl font-black uppercase text-white">
              Текст работы с отметками
            </h2>
            <p className="mt-1 text-xs text-white/40">
              ИИ выделил фрагменты, на которые обратил внимание при проверке.
            </p>
            <div className="mt-4">
              <HighlightedText text={submission.answer} highlights={highlights} />
            </div>
            {/* Легенда */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#7CFF8A]/60" />
                Положительное
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#FF4D5E]/60" />
                Замечание
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#FFD166]/60" />
                Нейтральное
              </span>
            </div>
          </section>
        )}

        {/* Заметки ИИ (если нет highlights — показываем список цитат) */}
        {highlights && highlights.length > 0 && (
          <section className="glass-card mt-4 p-6">
            <h2 className="text-xl font-black uppercase text-white">
              Заметки ИИ
            </h2>
            <div className="mt-4 grid gap-3">
              {highlights.map((h, i) => {
                const borderColor =
                  h.type === "positive"
                    ? "#7CFF8A"
                    : h.type === "negative"
                    ? "#FF4D5E"
                    : "#FFD166";
                return (
                  <div
                    key={i}
                    className="rounded-md border-l-4 bg-white/5 p-3"
                    style={{ borderColor }}
                  >
                    <p className="text-xs font-mono text-white/60 italic">
                      &ldquo;{h.text}&rdquo;
                    </p>
                    <p className="mt-1 text-sm text-white/80">{h.note}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

// Компонент подсветки текста
function HighlightedText({
  text,
  highlights,
}: {
  text: string;
  highlights: Highlight[];
}) {
  // Строим сегменты текста с подсветкой
  type Segment = {
    text: string;
    highlight?: Highlight;
  };

  const segments: Segment[] = [];
  let remaining = text;

  // Жадный алгоритм: для каждой позиции ищем совпадение
  while (remaining.length > 0) {
    let foundIndex = -1;
    let foundLength = 0;
    let foundHighlight: Highlight | undefined;

    for (const h of highlights) {
      const idx = remaining.indexOf(h.text);
      if (idx !== -1 && (foundIndex === -1 || idx < foundIndex)) {
        foundIndex = idx;
        foundLength = h.text.length;
        foundHighlight = h;
      }
    }

    if (foundIndex === -1) {
      segments.push({ text: remaining });
      break;
    }

    if (foundIndex > 0) {
      segments.push({ text: remaining.slice(0, foundIndex) });
    }
    segments.push({ text: remaining.slice(foundIndex, foundIndex + foundLength), highlight: foundHighlight });
    remaining = remaining.slice(foundIndex + foundLength);
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-white/75">
      {segments.map((seg, i) => {
        if (!seg.highlight) {
          return <span key={i}>{seg.text}</span>;
        }
        const bgColor =
          seg.highlight.type === "positive"
            ? "rgba(124,255,138,0.22)"
            : seg.highlight.type === "negative"
            ? "rgba(255,77,94,0.22)"
            : "rgba(255,209,102,0.22)";
        const borderColor =
          seg.highlight.type === "positive"
            ? "#7CFF8A"
            : seg.highlight.type === "negative"
            ? "#FF4D5E"
            : "#FFD166";
        return (
          <span
            key={i}
            title={seg.highlight.note}
            className="cursor-help rounded-sm border-b-2"
            style={{ background: bgColor, borderColor }}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}
