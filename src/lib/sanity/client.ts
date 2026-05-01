import { createClient } from "next-sanity";
import { hasSanityConfig, sanityEnv } from "@/lib/sanity/env";

export const sanityClient = createClient({
  projectId: sanityEnv.projectId || "missing-project-id",
  dataset: sanityEnv.dataset,
  apiVersion: sanityEnv.apiVersion,
  useCdn: true,
  token: sanityEnv.readToken,
  perspective: "published",
});

export function ensureSanityConfig() {
  if (!hasSanityConfig()) {
    throw new Error(
      "Sanity configuration missing. Add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to .env.local.",
    );
  }
}
