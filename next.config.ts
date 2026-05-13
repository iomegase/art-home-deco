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
