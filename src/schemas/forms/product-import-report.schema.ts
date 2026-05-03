import { z } from "zod";

export const productImportReportFilterSchema = z.object({
  eventId: z.string().optional(),
  status: z.string().optional(),
  actorEmail: z.string().optional(),
  batchLabel: z.string().optional(),
});

export type ProductImportReportFilterInput = z.infer<typeof productImportReportFilterSchema>;
