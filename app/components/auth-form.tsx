"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function getAuthErrorMessage(error: string | null, mode: "login" | "register") {
  if (!error) {
    return "";
  }

  const messages: Record<string, string> = {
    invalid:
      mode === "login"
        ? "Неправильная почта или пароль."
        : "Введите email и пароль не короче 8 символов.",
    missing: "Введите почту и пароль.",
    exists: "Пользователь с таким email уже существует.",
  };

  return messages[error] ?? "Не удалось выполнить действие.";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlErrorMessage = getAuthErrorMessage(searchParams.get("error"), mode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "login") {
      return;
    }

    if (!searchParams.has("email") && !searchParams.has("password")) {
      return;
    }

    const next = searchParams.get("next");
    const errorParam = searchParams.get("error");
    const cleanParams = new URLSearchParams();

    if (next) {
      cleanParams.set("next", next);
    }

    if (errorParam) {
      cleanParams.set("error", errorParam);
    }

    const query = cleanParams.toString();
    router.replace(query ? `/login?${query}` : "/login");
  }, [mode, router, searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(
        payload.error ??
          (mode === "login"
            ? "Неправильная почта или пароль."
            : "Не удалось выполнить действие."),
      );
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      method="post"
      action={`/api/auth/${mode}`}
      className="glass-card mx-auto max-w-lg p-6"
    >
      <h1 className="text-4xl font-black uppercase text-white">
        {mode === "login" ? "Войти" : "Попробовать бесплатно"}
      </h1>
      <p className="mt-3 text-base font-medium leading-7 text-white/70">
        {mode === "login"
          ? "Введите данные аккаунта, чтобы открыть личный кабинет."
          : "Создайте аккаунт и отправьте первую работу на проверку."}
      </p>

      {mode === "register" && (
        <label className="mt-6 block">
          <span className="text-sm font-bold uppercase text-white/60">Имя</span>
          <input
            name="name"
            autoComplete="name"
            className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
            placeholder="Анна"
          />
        </label>
      )}

      <label className="mt-6 block">
        <span className="text-sm font-bold uppercase text-white/60">Email</span>
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
          placeholder="student@example.com"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-bold uppercase text-white/60">
          Пароль
        </span>
        <input
          required
          name="password"
          type="password"
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-2 w-full rounded-md border border-white/15 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#00FFD7]"
          placeholder="Минимум 8 символов"
        />
      </label>

      {(error || urlErrorMessage) && (
        <p className="mt-4 text-sm font-bold text-[#FF9AA4]" aria-live="polite">
          {error || urlErrorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="animated-gradient-button mt-6 w-full rounded-md px-5 py-4 text-sm font-black uppercase text-white disabled:opacity-60"
      >
        {loading
          ? "Проверяем..."
          : mode === "login"
            ? "Войти"
            : "Создать аккаунт"}
      </button>
    </form>
  );
}
