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

const nextConfig: NextConfig = {
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
