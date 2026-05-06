import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "@/server/env";

type GeminiJsonInput = {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
};

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  if (start === -1) {
    throw new Error("Gemini response did not contain a JSON object.");
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  throw new Error("Gemini response contained an incomplete JSON object.");
}

function getGeminiApiKey() {
  const env = getEnv();
  return env.GOOGLE_GENERATIVE_AI_API_KEY ?? env.GEMINI_API_KEY;
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export async function generateGeminiJson<T>(input: GeminiJsonInput) {
  const apiKey = getGeminiApiKey();
  const env = getEnv();

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = input.model ?? env.GEMINI_MODEL ?? "gemini-2.5-flash";
  console.info("Gemini generateContent model", { model: modelName });
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(input.systemInstruction ? { systemInstruction: input.systemInstruction } : {}),
    generationConfig: {
      temperature: input.temperature ?? 0.7,
      topP: input.topP ?? 0.9,
      maxOutputTokens: input.maxOutputTokens ?? 4096,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(input.prompt);
  const response = await result.response;
  const text = response.text().trim();

  if (!text) {
    throw new Error("Gemini response did not contain text.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return JSON.parse(extractJsonObject(text)) as T;
  }
}
