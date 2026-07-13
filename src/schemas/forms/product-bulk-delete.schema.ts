import { z } from "zod";

const productBulkDeleteIdsSchema = z
  .array(z.string().trim().min(1))
  .transform((ids) => [...new Set(ids)])
  .pipe(z.array(z.string()).min(1).max(1000));

export function parseProductBulkDeleteIds(ids: string[]) {
  return productBulkDeleteIdsSchema.parse(ids);
}
