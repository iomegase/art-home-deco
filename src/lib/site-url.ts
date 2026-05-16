export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://arthomedeco.fr";

  return rawUrl.replace(/\/+$/, "");
}
