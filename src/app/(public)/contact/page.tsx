import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Art Home Déco pour une demande client, une proposition fournisseur, une collaboration créateur ou une question générale.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="mx-auto max-w-[1240px] px-6 pb-16 pt-20 md:px-16 md:pt-28 lg:px-0">
        <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Contact
        </p>
        <h1 className="text-[56px] font-[300] leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-[88px]">
          Parlons de
          <br />
          <span className="text-[#b0a99a]">votre projet.</span>
        </h1>
        <p className="mt-10 max-w-[440px] text-[12px] font-bold uppercase leading-6 tracking-[0.12em] text-slate-500">
          Demande client, proposition fournisseur, collaboration créateur ou message libre.
        </p>
      </header>

      {/* ── Form ── */}
      <div className="mx-auto max-w-[1240px] px-6 pb-32 md:px-16 lg:px-0">
        <ContactForm />
      </div>
    </main>
  );
}
