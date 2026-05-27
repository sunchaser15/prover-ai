import { getRussianPrompt } from "./prompts/russian";
import { getSocialSciencePrompt } from "./prompts/social-science";
import { getHistoryPrompt } from "./prompts/history";
import { getEnglishPrompt } from "./prompts/english";

export type CriterionScore = {
  code: string;
  name: string;
  score: number;
  max: number;
  comment: string;
};

export type Highlight = {
  text: string;
  note: string;
  type: "positive" | "negative" | "neutral";
};

export type AiCheckResult = {
  score: number;
  maxScore: number;
  criteriaScores: CriterionScore[];
  highlights: Highlight[];
  strengths: string;
  improvements: string;
  mistakes: string;
  recommendation: string;
};

function getSystemPrompt(subjectSlug: string, taskType: string): string | null {
  if (subjectSlug === "russian") {
    return getRussianPrompt(taskType as Parameters<typeof getRussianPrompt>[0]);
  }
  if (subjectSlug === "social-science") {
    return getSocialSciencePrompt(taskType as Parameters<typeof getSocialSciencePrompt>[0]);
  }
  if (subjectSlug === "history") {
    return getHistoryPrompt(taskType as Parameters<typeof getHistoryPrompt>[0]);
  }
  if (subjectSlug === "english") {
    return getEnglishPrompt(taskType as Parameters<typeof getEnglishPrompt>[0]);
  }
  return null;
}

export async function createAiCheck(params: {
  subjectSlug: string;
  taskType: string;
  answer: string;
}): Promise<AiCheckResult> {
  const { subjectSlug, taskType, answer } = params;
  const systemPrompt = getSystemPrompt(subjectSlug, taskType);

  if (!systemPrompt) {
    throw new Error(`Предмет "${subjectSlug}" пока не поддерживается для AI-проверки.`);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY не настроен.");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            parts: [{ text: answer }],
            role: "user",
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ошибка Gemini API: ${response.status} — ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let result: AiCheckResult;
  try {
    result = JSON.parse(rawText) as AiCheckResult;
  } catch {
    throw new Error(`Не удалось разобрать ответ Gemini: ${rawText.slice(0, 200)}`);
  }

  return result;
}

/** Список поддерживаемых предметов */
export const AI_SUPPORTED_SUBJECTS = ["russian", "social-science", "history", "english"];
