export const RUSSIAN_TASKS = [
  { value: "russian-27", label: "Задание 27 — Сочинение-рассуждение" },
] as const;

export const SOCIAL_SCIENCE_TASKS = [
  { value: "social-25", label: "Задание 25 — Составление плана" },
  { value: "social-26", label: "Задание 26 — Задание с источником" },
  { value: "social-27", label: "Задание 27 — Задание-задача" },
  { value: "social-28", label: "Задание 28 — Задание с понятием" },
  { value: "social-29", label: "Задание 29 — Эссе" },
] as const;

export const HISTORY_TASKS = [
  { value: "history-18", label: "Задание 18 — Аргументы к суждению" },
  { value: "history-19", label: "Задание 19 — Анализ исторической ситуации" },
  { value: "history-20", label: "Задание 20 — Историческое сочинение" },
] as const;

export const ENGLISH_TASKS = [
  { value: "english-37", label: "Задание 37 — Личное письмо" },
  { value: "english-38", label: "Задание 38 — Электронное письмо" },
  { value: "english-39", label: "Задание 39 — Короткое высказывание (40 слов)" },
  { value: "english-40", label: "Задание 40 — Развёрнутое эссе (200–250 слов)" },
] as const;

export type RussianTaskType = (typeof RUSSIAN_TASKS)[number]["value"];
export type SocialScienceTaskType = (typeof SOCIAL_SCIENCE_TASKS)[number]["value"];
export type HistoryTaskType = (typeof HISTORY_TASKS)[number]["value"];
export type EnglishTaskType = (typeof ENGLISH_TASKS)[number]["value"];

export function getTasksForSubject(subjectSlug: string) {
  switch (subjectSlug) {
    case "russian":
      return RUSSIAN_TASKS;
    case "social-science":
      return SOCIAL_SCIENCE_TASKS;
    case "history":
      return HISTORY_TASKS;
    case "english":
      return ENGLISH_TASKS;
    default:
      return null;
  }
}
