import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();

  if (normalized === "" || normalized === '""' || normalized === "''") {
    return undefined;
  }

  return normalized;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional()).optional();
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional()).optional();
const optionalEmail = z.preprocess(emptyToUndefined, z.email().optional()).optional();
const optionalPassword = z.preprocess(emptyToUndefined, z.string().min(8).optional()).optional();
const optionalSecret = z.preprocess(emptyToUndefined, z.string().min(32).optional()).optional();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  ADMIN_EMAIL: optionalEmail,
  ADMIN_PASSWORD: optionalPassword,
  ADMIN_SESSION_SECRET: optionalSecret,
  SHOPCAISSE_API_URL: optionalUrl,
  SHOPCAISSE_API_KEY: optionalString,
  SHOPCAISSE_STORE_ID: optionalString,
  SHOPCAISSE_API_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  SHOPCAISSE_WEBHOOK_SECRET: optionalSecret,
  SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  EMAIL_REPLY_TO: optionalString,
  ADMIN_ORDER_EMAIL: optionalEmail,
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: optionalString,
});

export type AppEnv = z.infer<typeof envSchema>;
