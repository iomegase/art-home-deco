const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-04-29";

export const sanityEnv = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion,
  readToken: process.env.SANITY_API_READ_TOKEN,
};

export function hasSanityConfig() {
  return Boolean(sanityEnv.projectId && sanityEnv.dataset);
}
