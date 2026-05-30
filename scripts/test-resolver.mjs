// Test-only module resolution hook for `node --test`.
// - Maps the "@/..." TypeScript path alias to ./src/...
// - Resolves extensionless local specifiers to their .ts/.tsx file.
// - Resolves directory/barrel imports to their index.ts/index.tsx.
// Production builds (Next.js / SWC) and `tsc` are unaffected; this only runs
// when explicitly registered for the Node test runner.
import { pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const SRC_URL = pathToFileURL(resolvePath(process.cwd(), "src") + "/").href;

// Suffixes tried (in order) when the bare specifier fails to resolve:
// the .ts/.tsx file itself, then the directory's index file.
const LOCAL_FALLBACK_SUFFIXES = [".ts", ".tsx", "/index.ts", "/index.tsx"];

export async function resolve(specifier, context, nextResolve) {
  let spec = specifier;

  if (spec.startsWith("@/")) {
    spec = new URL(spec.slice(2), SRC_URL).href;
  }

  try {
    return await nextResolve(spec, context);
  } catch (error) {
    if (spec.startsWith("file:") || spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("/")) {
      for (const suffix of LOCAL_FALLBACK_SUFFIXES) {
        try {
          return await nextResolve(spec + suffix, context);
        } catch {
          // try next candidate
        }
      }
    }
    throw error;
  }
}
