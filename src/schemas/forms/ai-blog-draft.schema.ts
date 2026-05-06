import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

export const aiBlogDraftSchema = z.object({
  topic: z.string().min(5),
  intent: z.enum(["guide_achat", "conseil_deco", "idee_cadeau", "tendance"]),
  targetKeyword: z.string().min(2),
  includeBlogContext: z.boolean().default(true),
  boutiqueProductLink: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => value.startsWith("/boutique") || value.startsWith("http://") || value.startsWith("https://"), {
        message: "Le lien produit doit commencer par /boutique, http:// ou https://.",
      })
      .optional(),
  ),
});

export type AiBlogDraftInput = z.infer<typeof aiBlogDraftSchema>;
