import { db } from "@/server/db/client";

export const PUBLICATION_STATUSES = ["draft", "active", "archived"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export function isPublicationStatus(value: string): value is PublicationStatus {
  return (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

export async function setProductsStatus(ids: string[], status: PublicationStatus) {
  if (ids.length === 0) {
    return { count: 0 };
  }
  return db.product.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
}

export async function archiveProducts(ids: string[]) {
  return setProductsStatus(ids, "archived");
}
