import { slugify } from "@/lib/slugify";
import type { ShopcaisseFamilyRecord } from "./catalog.types";

export type NormalizedFamily = {
  externalFamilyId: string;
  name: string;
  position: number;
};

const EXCLUDED_FAMILY_NAMES = new Set(["system family", "pas de famille"]);

export function shouldSyncFamily(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return !EXCLUDED_FAMILY_NAMES.has(normalized);
}

export function normalizeFamilyRecords(records: ShopcaisseFamilyRecord[]): NormalizedFamily[] {
  const result: NormalizedFamily[] = [];

  for (const record of records) {
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";

    if (!id || !shouldSyncFamily(name)) {
      continue;
    }

    result.push({
      externalFamilyId: id,
      name,
      position:
        typeof record.position === "number" && Number.isFinite(record.position) ? record.position : 0,
    });
  }

  return result;
}

/**
 * Returns a slug for `name` that is not already in `used` (falls back to
 * "categorie" for names that slugify to empty, then suffixes -2, -3, …).
 *
 * Note: this does NOT mutate `used`. Callers building several slugs in a loop
 * must add each returned slug to `used` themselves before the next call,
 * otherwise duplicates can be produced.
 */
export function buildUniqueCategorySlug(name: string, used: Set<string>): string {
  const base = slugify(name) || "categorie";
  if (!used.has(base)) {
    return base;
  }
  let attempt = 2;
  while (used.has(`${base}-${attempt}`)) {
    attempt += 1;
  }
  return `${base}-${attempt}`;
}
