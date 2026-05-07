import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Art Home Déco pour une demande client, une proposition fournisseur, une collaboration créateur ou une question générale.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <ContactForm />
    </div>
  );
}
