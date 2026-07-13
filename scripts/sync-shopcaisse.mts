/**
 * Standalone Shopcaisse catalog sync.
 *
 * Fetches the full Shopcaisse catalog and writes it to the local DB cache that
 * the admin import screen reads from. This lives outside the Next.js app so it
 * can run without Vercel's serverless timeout (the full catalog fetch takes
 * ~20s+, which exceeds the Vercel Hobby 10s cap). It is invoked on a schedule
 * by .github/workflows/sync-catalogue.yml, and can also be run locally.
 *
 * Local run:  npx tsx scripts/sync-shopcaisse.mts
 * Required env: DATABASE_URL, SHOPCAISSE_API_URL, SHOPCAISSE_API_KEY,
 *               SHOPCAISSE_COMPANY_ID, SHOPCAISSE_STORE_ID, SHOPCAISSE_POS_ID
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Load .env for local runs. In CI, the real values come from process.env, and
// we never overwrite an already-set variable.
const envPath = path.join(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

async function main() {
  const { getShopcaisseCatalogSnapshot } = await import("../src/server/services/shopcaisse/client.ts");
  const { syncShopcaisseCatalogCache, syncShopcaisseCategories } = await import(
    "../src/server/repositories/shopcaisse-catalog.repository.ts"
  );
  const { db } = await import("../src/server/db/client.ts");

  const startedAt = Date.now();
  console.log("[sync-shopcaisse] Fetching catalog snapshot from Shopcaisse...");
  const snapshot = await getShopcaisseCatalogSnapshot();
  console.log(
    `[sync-shopcaisse] Fetched ${snapshot.items.length} items and ${snapshot.families.length} families in ${(
      (Date.now() - startedAt) /
      1000
    ).toFixed(1)}s.`,
  );

  const cacheResult = await syncShopcaisseCatalogCache(snapshot.items);
  const categoryResult = await syncShopcaisseCategories(snapshot.families);

  console.log("[sync-shopcaisse] Cache synced:", {
    created: cacheResult.createdCount,
    updated: cacheResult.updatedCount,
    skipped: cacheResult.skippedCount,
    errors: cacheResult.errors.length,
  });
  console.log("[sync-shopcaisse] Categories synced:", categoryResult);

  if (cacheResult.errors.length > 0) {
    console.warn("[sync-shopcaisse] First cache errors:", cacheResult.errors.slice(0, 5));
  }

  await db.$disconnect();
  console.log(`[sync-shopcaisse] Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`);
}

main().catch((error) => {
  console.error("[sync-shopcaisse] FAILED:", error);
  process.exit(1);
});
