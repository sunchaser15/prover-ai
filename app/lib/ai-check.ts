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

export type AiInputImage = {
  name?: string;
  mimeType: string;
  dataUrl: string;
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

type OpenRouterResponse = {
  choices?: { message?: { content?: string | unknown[] } }[];
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
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

function getImageBase64(image: AiInputImage) {
  const [, data = ""] = image.dataUrl.split(",", 2);
  return data;
}

export async function createAiCheck(params: {
  subjectSlug: string;
  taskType: string;
  answer: string;
  images?: AiInputImage[];
}): Promise<AiCheckResult> {
  const { subjectSlug, taskType, answer, images = [] } = params;
  const systemPrompt = getSystemPrompt(subjectSlug, taskType);

  if (!systemPrompt) {
    throw new Error(`Предмет "${subjectSlug}" пока не поддерживается для AI-проверки.`);
  }

  if (process.env.OPENROUTER_API_KEY) {
    return createOpenRouterCheck({ systemPrompt, answer, images });
  }

  if (process.env.GEMINI_API_KEY) {
    return createGeminiCheck({ systemPrompt, answer, images });
  }

  throw new Error("OPENROUTER_API_KEY или GEMINI_API_KEY не настроен.");
}

async function createOpenRouterCheck({
  systemPrompt,
  answer,
  images,
}: {
  systemPrompt: string;
  answer: string;
  images: AiInputImage[];
}): Promise<AiCheckResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY не настроен.");
  }

  const model = process.env.OPENROUTER_MODEL ??
    (images.length > 0 ? "google/gemini-2.0-flash-001" : "google/gemma-4-31b-it:free");
  const userContent = [
    { type: "text", text: answer },
    ...images.map((image) => ({
      type: "image_url",
      image_url: { url: image.dataUrl },
    })),
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000",
      "X-Title": "Prover AI",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: images.length > 0 ? userContent : answer },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ошибка OpenRouter API: ${response.status} — ${errorBody}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  const rawText = typeof content === "string" ? content : JSON.stringify(content ?? "");

  return parseAiCheckJson(rawText, "OpenRouter");
}

async function createGeminiCheck({
  systemPrompt,
  answer,
  images,
}: {
  systemPrompt: string;
  answer: string;
  images: AiInputImage[];
}): Promise<AiCheckResult> {
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
            parts: [
              { text: answer },
              ...images.map((image) => ({
                inlineData: {
                  mimeType: image.mimeType,
                  data: getImageBase64(image),
                },
              })),
            ],
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

  const data = (await response.json()) as GeminiResponse;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return parseAiCheckJson(rawText, "Gemini");
}

function parseAiCheckJson(rawText: string, provider: string): AiCheckResult {
  try {
    return JSON.parse(rawText) as AiCheckResult;
  } catch {
    throw new Error(`Не удалось разобрать ответ ${provider}: ${rawText.slice(0, 200)}`);
  }
}

/** Список поддерживаемых предметов */
export const AI_SUPPORTED_SUBJECTS = ["russian", "social-science", "history", "english"];
