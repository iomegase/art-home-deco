import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/server/env";

const ADMIN_SESSION_COOKIE = "admin_session";

type SessionPayload = {
  email: string;
  role: "admin" | "owner";
  exp: number;
};

function base64urlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadEncoded: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
}

function encodeSession(payload: SessionPayload, secret: string): string {
  const payloadEncoded = base64urlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
}

function decodeSession(token: string, secret: string): SessionPayload | null {
  const [payloadEncoded, signature] = token.split(".");

  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadEncoded, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let payload: SessionPayload;

  try {
    payload = JSON.parse(base64urlDecode(payloadEncoded)) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function createAdminSession(input: { email: string; password: string }): Promise<boolean> {
  const env = getEnv();
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;
  const sessionSecret = env.ADMIN_SESSION_SECRET;

  if (!adminEmail || !adminPassword || !sessionSecret) {
    return false;
  }

  if (input.email !== adminEmail || input.password !== adminPassword) {
    return false;
  }

  const payload: SessionPayload = {
    email: input.email,
    role: "owner",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };

  const token = encodeSession(payload, sessionSecret);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function getAdminSession(): Promise<{ userId: string; role: "admin" | "owner" } | null> {
  const env = getEnv();
  const sessionSecret = env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    return null;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = decodeSession(token, sessionSecret);

  if (!payload) {
    return null;
  }

  return { userId: payload.email, role: payload.role };
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function requireAdmin(): Promise<{ userId: string; role: "admin" | "owner" }> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
