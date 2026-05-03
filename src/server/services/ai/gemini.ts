import { getEnv } from "@/server/env";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/";

type GeminiTextPart = {
  text?: string;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiTextPart[];
    };
  }>;
};

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not contain a JSON object.");
  }

  return text.slice(start, end + 1);
}

export function isGeminiConfigured() {
  const env = getEnv();
  return Boolean(env.GEMINI_API_KEY);
}

export async function generateGeminiJson<T>(input: {
  prompt: string;
  systemInstruction?: string;
}) {
  const env = getEnv();

  if (!env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const response = await fetch(`${GEMINI_API_BASE_URL}models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      ...(input.systemInstruction
        ? {
            systemInstruction: {
              parts: [{ text: input.systemInstruction }],
            },
          }
        : {}),
      contents: [
        {
          role: "user",
          parts: [{ text: input.prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    throw new Error("Gemini response did not contain text.");
  }

  return JSON.parse(extractJsonObject(text)) as T;
}
