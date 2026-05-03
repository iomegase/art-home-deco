const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  shopcaisseRateLimitStore?: Map<string, Bucket>;
};

const store = globalStore.shopcaisseRateLimitStore ?? new Map<string, Bucket>();
globalStore.shopcaisseRateLimitStore = store;

export function checkShopcaisseWebhookRateLimit(key: string) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true as const, remaining: MAX_REQUESTS - 1 };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false as const, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  return { allowed: true as const, remaining: MAX_REQUESTS - current.count };
}
