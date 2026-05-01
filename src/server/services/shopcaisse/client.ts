import { getEnv } from "@/server/env";
import { ShopcaisseConfigError, ShopcaisseResponseError } from "./errors";

export async function shopcaisseRequest<T>(input: {
  url: string | undefined;
  method?: "GET" | "POST";
  body?: unknown;
}): Promise<T> {
  const env = getEnv();

  if (!input.url) {
    throw new ShopcaisseConfigError("Shopcaisse URL is not configured.");
  }

  if (!env.SHOPCAISSE_API_KEY) {
    throw new ShopcaisseConfigError("Shopcaisse API key is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.SHOPCAISSE_API_TIMEOUT_MS ?? 10000);

  try {
    const response = await fetch(input.url, {
      method: input.method ?? "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.SHOPCAISSE_API_KEY}`,
        "Content-Type": "application/json",
        ...(env.SHOPCAISSE_STORE_ID ? { "X-Store-Id": env.SHOPCAISSE_STORE_ID } : {}),
      },
      body: input.body ? JSON.stringify(input.body) : undefined,
    });

    if (!response.ok) {
      throw new ShopcaisseResponseError(`Shopcaisse request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
