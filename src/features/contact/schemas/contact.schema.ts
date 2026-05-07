import { z } from "zod";

export const contactProfileSchema = z.enum(["client", "supplier", "creator", "general"]);

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

const requiredString = (label: string, min = 2) => z.string().trim().min(min, `${label} est requis.`);
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().url("URL invalide.").optional());

const baseContactSchema = z.object({
  type: contactProfileSchema,
  firstName: requiredString("Le prenom"),
  lastName: requiredString("Le nom"),
  email: z.string().trim().email("Email invalide."),
  phone: optionalString,
  message: z.string().trim().min(20, "Le message doit contenir au moins 20 caracteres."),
  consent: z.boolean().refine((value) => value, {
    message: "Le consentement RGPD est obligatoire.",
  }),
  whatsappOptIn: z.boolean().default(false),
  honeypot: z.string().trim().max(0).default(""),
  clientSubject: optionalString,
  orderNumber: optionalString,
  companyName: optionalString,
  website: optionalUrl,
  productCategory: optionalString,
  siret: optionalString,
  brandName: optionalString,
  location: optionalString,
  productUniverse: optionalString,
  websiteOrInstagram: optionalString,
  collaborationType: optionalString,
});

export const contactRequestSchema = baseContactSchema.superRefine((value, ctx) => {
  if (value.type === "client" && !value.clientSubject) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["clientSubject"],
      message: "Le sujet de la demande est requis.",
    });
  }

  if (value.type === "supplier") {
    if (!value.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Le nom de l'entreprise est requis.",
      });
    }

    if (!value.website) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["website"],
        message: "Le site web est requis.",
      });
    }

    if (!value.productCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productCategory"],
        message: "La categorie de produits est requise.",
      });
    }
  }

  if (value.type === "creator") {
    for (const [field, message] of [
      ["brandName", "Le nom de marque ou atelier est requis."],
      ["location", "La localisation est requise."],
      ["productUniverse", "L'univers produit est requis."],
      ["websiteOrInstagram", "Le site web ou Instagram est requis."],
      ["collaborationType", "Le type de collaboration souhaite est requis."],
    ] as const) {
      if (!value[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message,
        });
      }
    }
  }
});

export type ContactRequestInput = z.input<typeof contactRequestSchema>;
export type ContactRequest = z.output<typeof contactRequestSchema>;

export type ContactApiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const contactProfileOptions = [
  {
    value: "client",
    title: "Client",
    description: "Question produit, commande, livraison ou conseil decoration.",
  },
  {
    value: "supplier",
    title: "Fournisseur",
    description: "Proposition de catalogue, sourcing ou relation commerciale.",
  },
  {
    value: "creator",
    title: "Createur / Artisan",
    description: "Collaboration, diffusion de collection ou projet sur mesure.",
  },
  {
    value: "general",
    title: "Autre demande",
    description: "Partenariat, presse, demande generale ou prise de contact libre.",
  },
] as const;
