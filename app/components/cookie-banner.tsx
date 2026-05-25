"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "prover_cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

function logCookieConsent(type: "cookie_accept" | "cookie_decline") {
  fetch("/api/consents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus | "loading">("loading");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
    setStatus(saved);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setStatus("accepted");
    logCookieConsent("cookie_accept");
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setStatus("declined");
    logCookieConsent("cookie_decline");
  }

  // Не показываем пока идёт проверка localStorage или если уже выбрано
  if (status !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
    >
      <div className="glass-card flex flex-col gap-4 p-5 shadow-2xl sm:flex-row sm:items-center sm:gap-6">
        <ShieldCheck className="hidden shrink-0 text-[#00FFD7] sm:block" size={28} />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase text-white">Файлы cookie</p>
          <p className="mt-1 text-xs font-medium leading-5 text-white/65">
            Мы используем только необходимые куки для авторизации (сессия). Никакой
            рекламной аналитики или трекинга без вашего согласия.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Отклонить
          </button>
          <button
            onClick={accept}
            className="animated-gradient-button rounded-md px-4 py-2 text-xs font-black uppercase text-white"
          >
            Принять
          </button>
        </div>

        <button
          onClick={decline}
          aria-label="Закрыть"
          className="absolute right-3 top-3 text-white/40 transition hover:text-white sm:hidden"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
