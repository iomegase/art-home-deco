import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function extractFamilyId(rawJson) {
  const family = rawJson?.product?.family;
  const id = family?.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

const rows = await db.shopcaisseProductCache.findMany({
  where: { familyId: null },
  select: { id: true, rawJson: true },
});

let updated = 0;
let missing = 0;

for (const row of rows) {
  const familyId = extractFamilyId(row.rawJson);
  if (!familyId) {
    missing += 1;
    continue;
  }
  await db.shopcaisseProductCache.update({
    where: { id: row.id },
    data: { familyId },
  });
  updated += 1;
}

console.log(`cache rows scanned: ${rows.length}`);
console.log(`familyId backfilled: ${updated}`);
console.log(`no family.id in rawJson: ${missing}`);

await db.$disconnect();
