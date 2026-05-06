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
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_GTM_ID: optionalString,
  NEXT_PUBLIC_GA4_ID: optionalString,
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_META_PIXEL_ID: optionalString,
  NEXT_PUBLIC_CLARITY_ID: optionalString,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optionalEmail,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: optionalString,
  GOOGLE_ANALYTICS_PROPERTY_ID: optionalString,
  GOOGLE_SEARCH_CONSOLE_SITE_URL: optionalString,
  DATABASE_URL: z.string().min(1),
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
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_BASE_URL: optionalUrl,
  R2_REGION: optionalString,
  GOOGLE_GENERATIVE_AI_API_KEY: optionalString,
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: optionalString,
  WHATSAPP_ACCESS_TOKEN: optionalString,
  WHATSAPP_PHONE_NUMBER_ID: optionalString,
  WHATSAPP_VERIFY_TOKEN: optionalString,
  WHATSAPP_SEND_API_KEY: optionalSecret,
});

export type AppEnv = z.infer<typeof envSchema>;
