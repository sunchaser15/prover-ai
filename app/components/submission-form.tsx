"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { getTasksForSubject } from "@/app/lib/tasks";

type Subject = { id: string; slug: string; title: string };

export function SubmissionForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [taskType, setTaskType] = useState<string>("");
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [noPersonalData, setNoPersonalData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasks = selectedSubject ? getTasksForSubject(selectedSubject.slug) : null;

  function handleSubjectChange(id: string) {
    const subj = subjects.find((s) => s.id === id);
    if (subj) {
      setSelectedSubject(subj);
      setTaskType(""); // сбрасываем задание при смене предмета
    }
  }

  async function logConsent(type: string) {
    try {
      await fetch("/api/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } catch {
      // не блокируем при ошибке
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newImages = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5 - images.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = Array.from(items)
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];
    if (imageFiles.length > 0) {
      e.preventDefault();
      handleFiles(
        Object.assign(imageFiles, { length: imageFiles.length }) as unknown as FileList
      );
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const answerText = (formData.get("answer") as string) ?? "";

    if (!taskType) {
      setError("Выберите тип задания.");
      setLoading(false);
      return;
    }

    if (answerText.trim().length < 30 && images.length === 0) {
      setError("Добавьте ответ: текст (от 30 символов) или фото.");
      setLoading(false);
      return;
    }

    if (!noPersonalData) {
      setError("Подтвердите, что ответ не содержит персональных данных.");
      setLoading(false);
      return;
    }

    void logConsent(images.length > 0 ? "answer_photo" : "answer_text");

    // Формируем название автоматически из предмета + задания
    const taskLabel = tasks?.find((t) => t.value === taskType)?.label ?? taskType;
    const title = `${selectedSubject.title} — ${taskLabel}`;

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject.id,
        title,
        taskType,
        answer: answerText || `[Фото ответа: ${images.length} шт.]`,
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
      {/* Предмет */}
      <label className="block">
        <span className="text-sm font-bold uppercase text-white/60">Предмет</span>
        <select
          name="subjectId"
          required
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
          onChange={(e) => handleSubjectChange(e.target.value)}
          value={selectedSubject?.id ?? ""}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.title}
            </option>
          ))}
        </select>
      </label>

      {/* Тип задания */}
      <label className="mt-5 block">
        <span className="text-sm font-bold uppercase text-white/60">
          Тип задания <span className="text-[#FF9AA4]">*</span>
        </span>
        {tasks ? (
          <select
            name="taskType"
            required
            className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            <option value="" disabled>
              Выберите задание...
            </option>
            {tasks.map((task) => (
              <option key={task.value} value={task.value}>
                {task.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="taskType"
            required
            className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
            placeholder="Например: 27"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          />
        )}
      </label>

      {/* Ответ */}
      <div className="mt-5">
        <span className="text-sm font-bold uppercase text-white/60">Ответ</span>

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Фото ${i + 1}`}
                  className="h-24 w-24 rounded-md border border-white/15 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D5E] text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative mt-2">
          <textarea
            name="answer"
            rows={10}
            onPaste={handlePaste}
            className="w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
            placeholder="Вставьте развёрнутый ответ или фото (Ctrl+V)..."
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 5}
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-white/70 backdrop-blur transition hover:border-[#00FFD7] hover:text-[#00FFD7] disabled:opacity-40"
          >
            <ImagePlus size={15} />
            Фото
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        <p className="mt-1 text-xs text-white/40">
          Только изображения (jpg, png, gif и др.). Максимум 5 фото.
        </p>
      </div>

      {/* Чекбокс */}
      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={noPersonalData}
          onChange={(e) => setNoPersonalData(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#00FFD7]"
        />
        <span className="text-sm font-medium leading-6 text-white/70">
          Подтверждаю, что ответ{" "}
          <span className="font-bold text-white">не содержит персональных данных</span>{" "}
          (ФИО, адрес, номер телефона и т.п.)
        </span>
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
