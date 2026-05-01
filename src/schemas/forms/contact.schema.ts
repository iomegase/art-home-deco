import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  message: z.string().min(10),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
