import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SHOULD_REDIRECT_VERCEL_HOST =
  process.env.ENABLE_PRIMARY_DOMAIN_REDIRECT === "true";

export function proxy(request: NextRequest) {
  if (!SHOULD_REDIRECT_VERCEL_HOST) {
    return NextResponse.next();
  }

  const host = request.headers.get("host");

  if (host === "art-home-deco.vercel.app") {
    const url = request.nextUrl.clone();
    url.hostname = "arthomedeco.fr";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
