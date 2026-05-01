import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Art Home Deco pour un conseil ou une commande.",
};

export default function ContactPage() {
  return (
    <div className="grain-bg showcase-shell page-enter py-14 md:py-20">
      <Container className="grid gap-7 md:grid-cols-2">
        <section className="showcase-panel organic-cut rounded-[2rem] p-7 md:p-8">
          <p className="section-title">Contact</p>
          <h1 className="mt-3 text-5xl">Parlons de votre interieur</h1>
          <p className="mt-4 text-muted">
            Cette page pose la structure du futur formulaire avec validation,
            anti-spam et envoi email.
          </p>
          <div className="mt-7">
            <ButtonLink href="/boutique">Voir la boutique</ButtonLink>
          </div>
        </section>

        <section className="showcase-panel rounded-[2rem] p-7 md:p-8">
          <h2 className="text-3xl">Informations</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Email: bonjour@arthomedeco.fr</li>
            <li>Telephone: +33 1 00 00 00 00</li>
            <li>Du lundi au samedi: 10h - 19h</li>
          </ul>
        </section>
      </Container>
    </div>
  );
}
