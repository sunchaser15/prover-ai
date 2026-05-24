"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SubmissionForm({
  subjects,
}: {
  subjects: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: formData.get("subjectId"),
        title: formData.get("title"),
        answer: formData.get("answer"),
      }),
    });
    const payload = (await response.json()) as {
      error?: string;
      submission?: { id: string };
    };

    setLoading(false);

    if (!response.ok || !payload.submission) {
      setError(payload.error ?? "Не удалось создать проверку.");
      return;
    }

    router.push(`/dashboard/submissions/${payload.submission.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-6">
      <label className="block">
        <span className="text-sm font-bold uppercase text-white/60">Предмет</span>
        <select
          name="subjectId"
          required
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.title}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-bold uppercase text-white/60">Название</span>
        <input
          name="title"
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
          placeholder="Сочинение по русскому"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-bold uppercase text-white/60">Ответ</span>
        <textarea
          name="answer"
          required
          minLength={30}
          rows={10}
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
          placeholder="Вставьте развёрнутый ответ..."
        />
      </label>

      {error && <p className="mt-4 text-sm font-bold text-[#FF9AA4]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="animated-gradient-button mt-6 rounded-md px-6 py-4 text-sm font-black uppercase text-white disabled:opacity-60"
      >
        {loading ? "Проверяем..." : "Отправить на проверку"}
      </button>
    </form>
  );
}
