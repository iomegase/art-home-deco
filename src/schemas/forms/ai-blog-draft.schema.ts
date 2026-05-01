import { z } from "zod";

export const aiBlogDraftSchema = z.object({
  topic: z.string().min(5),
  intent: z.enum(["guide_achat", "conseil_deco", "idee_cadeau", "tendance"]),
  targetKeyword: z.string().min(2),
});

export type AiBlogDraftInput = z.infer<typeof aiBlogDraftSchema>;
