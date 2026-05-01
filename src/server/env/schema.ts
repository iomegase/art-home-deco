import { z } from "zod";

const emptyString = z.literal("").transform(() => undefined);
const optionalString = z.union([z.string().min(1), emptyString]).optional();
const optionalUrl = z.union([z.string().url(), emptyString]).optional();
const optionalEmail = z.union([z.email(), emptyString]).optional();
const optionalPassword = z.union([z.string().min(8), emptyString]).optional();
const optionalSecret = z.union([z.string().min(32), emptyString]).optional();

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
  SHOPCAISSE_STOCK_SYNC_URL: optionalUrl,
  SHOPCAISSE_STOCK_VERIFY_URL: optionalUrl,
  SHOPCAISSE_MOVEMENT_URL: optionalUrl,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  EMAIL_REPLY_TO: optionalString,
  OPENAI_API_KEY: optionalString,
});

export type AppEnv = z.infer<typeof envSchema>;
