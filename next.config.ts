import type { NextConfig } from "next";

function buildR2RemotePattern() {
  const rawUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: `${parsed.pathname.replace(/\/$/, "")}/**`,
    };
  } catch {
    return null;
  }
}

const r2RemotePattern = buildR2RemotePattern();

const allowedDevOrigins: string[] =
  process.env.NODE_ENV === "development"
    ? [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((origin) => origin.trim()) ?? []),
      ]
    : [];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  // The AI blog-generation Server Action reads these markdown/JSON files from
  // disk at runtime (see src/features/ai/server/build-blog-prompt.ts). Their
  // paths are built dynamically, so Next's file tracing can't detect them and
  // they get dropped from the serverless bundle in production. Force-include
  // the whole ai/ directory for the admin routes that trigger the action.
  outputFileTracingIncludes: {
    "/admin/**": ["./ai/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "les-feesmeres.com",
      },
      ...(r2RemotePattern ? [r2RemotePattern] : []),
    ],
  },
};

export default nextConfig;
