"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Submission = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  createdAt: string;
  subject: { id: string; title: string };
};

function ProgressChart({ data }: { data: { date: string; score: number; maxScore: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-sm font-bold text-white/40">
        Нужно минимум 2 проверки для графика
      </div>
    );
  }

  const W = 600;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const percents = data.map((d) => Math.round((d.score / d.maxScore) * 100));
  const minP = Math.max(0, Math.min(...percents) - 10);
  const maxP = Math.min(100, Math.max(...percents) + 10);

  const xStep = innerW / (data.length - 1);
  const toY = (p: number) => PAD.top + innerH - ((p - minP) / (maxP - minP)) * innerH;
  const toX = (i: number) => PAD.left + i * xStep;

  const points = percents.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
  const fillPoints = [
    `${PAD.left},${PAD.top + innerH}`,
    ...percents.map((p, i) => `${toX(i)},${toY(p)}`),
    `${toX(data.length - 1)},${PAD.top + innerH}`,
  ].join(" ");

  // Метки по оси Y
  const yTicks = [minP, Math.round((minP + maxP) / 2), maxP];
  // Метки по оси X — только первая и последняя
  const xLabels = [
    { i: 0, label: formatDate(data[0].date) },
    { i: data.length - 1, label: formatDate(data[data.length - 1].date) },
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 160 }}
      aria-label="График прогресса"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CFF8A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7CFF8A" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Сетка */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            y1={toY(tick)}
            x2={W - PAD.right}
            y2={toY(tick)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 6}
            y={toY(tick) + 4}
            textAnchor="end"
            fontSize="10"
            fill="rgba(255,255,255,0.4)"
          >
            {tick}%
          </text>
        </g>
      ))}

      {/* Заливка */}
      <polygon points={fillPoints} fill="url(#chartFill)" />

      {/* Линия */}
      <polyline
        points={points}
        fill="none"
        stroke="#7CFF8A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Точки */}
      {percents.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p)} r="3.5" fill="#7CFF8A" />
      ))}

      {/* Метки X */}
      {xLabels.map(({ i, label }) => (
        <text
          key={i}
          x={toX(i)}
          y={H - 6}
          textAnchor={i === 0 ? "start" : "end"}
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

const DATE_OPTIONS = [
  { label: "Все время", days: 0 },
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
  { label: "90 дней", days: 90 },
];

export function DashboardClient({ submissions }: { submissions: Submission[] }) {
  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => map.set(s.subject.id, s.subject.title));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [submissions]);

  const [subjectFilter, setSubjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(0);

  const filtered = useMemo(() => {
    let result = submissions;
    if (subjectFilter !== "all") {
      result = result.filter((s) => s.subject.id === subjectFilter);
    }
    if (dateFilter > 0) {
      const cutoff = Date.now() - dateFilter * 24 * 60 * 60 * 1000;
      result = result.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
    }
    return result;
  }, [submissions, subjectFilter, dateFilter]);

  // Данные для графика — только отфильтрованные, в хронологическом порядке
  const chartData = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((s) => ({ date: s.createdAt, score: s.score, maxScore: s.maxScore })),
    [filtered]
  );

  const avgPercent = useMemo(() => {
    if (filtered.length === 0) return null;
    const sum = filtered.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0);
    return Math.round(sum / filtered.length);
  }, [filtered]);

  return (
    <div>
      {/* Фильтры */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubjectFilter("all")}
            className={`rounded-md border px-3 py-2 text-xs font-black uppercase transition ${
              subjectFilter === "all"
                ? "border-[#00FFD7]/50 bg-[#00FFD7]/12 text-[#00FFD7]"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
            }`}
          >
            Все предметы
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectFilter(s.id)}
              className={`rounded-md border px-3 py-2 text-xs font-black uppercase transition ${
                subjectFilter === s.id
                  ? "border-[#00FFD7]/50 bg-[#00FFD7]/12 text-[#00FFD7]"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDateFilter(opt.days)}
              className={`rounded-md border px-3 py-2 text-xs font-black uppercase transition ${
                dateFilter === opt.days
                  ? "border-[#BAFF72]/50 bg-[#BAFF72]/12 text-[#BAFF72]"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* График */}
      {filtered.length > 0 && (
        <div className="glass-card mb-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-white/55">График прогресса</p>
              {avgPercent !== null && (
                <p className="mt-1 text-sm font-bold text-white/40">
                  Средний балл:{" "}
                  <span className="text-[#7CFF8A]">{avgPercent}%</span>
                </p>
              )}
            </div>
            <span className="text-xs font-bold text-white/30">{filtered.length} проверок</span>
          </div>
          <ProgressChart data={chartData} />
        </div>
      )}

      {/* Список проверок */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((submission) => {
          const pct = Math.round((submission.score / submission.maxScore) * 100);
          return (
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
              <div className="mt-5 flex items-end justify-between">
                <strong className="text-4xl font-black text-[#7CFF8A]">
                  {submission.score}/{submission.maxScore}
                </strong>
                <span className="text-sm font-bold text-white/40">{pct}%</span>
              </div>
              <p className="mt-2 text-xs text-white/35">{formatDate(submission.createdAt)}</p>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-6 text-white/72">
          {submissions.length === 0
            ? "Пока нет работ. Начните с первой проверки."
            : "Нет проверок с выбранными фильтрами."}
        </div>
      )}
    </div>
  );
}
