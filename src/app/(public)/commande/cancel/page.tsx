import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement annule",
  description: "Le paiement n'a pas été confirmé. Vous pouvez revenir au panier et finaliser votre commande.",
  alternates: {
    canonical: "/commande/cancel",
  },
  openGraph: {
    title: "Paiement annule | Art Home Déco",
    description: "Paiement interrompu: votre panier est conservé pour reprendre la commande.",
    url: "/commande/cancel",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderCancelPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <p className="section-title text-terracotta">Paiement interrompu</p>
      <h1 className="mt-3 font-serif text-5xl leading-none md:text-7xl">Votre panier est conserve.</h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
        Aucun paiement n&apos;a ete confirme. Vous pouvez revenir au panier, modifier votre selection ou
        relancer le checkout.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/panier" className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Retour au panier
        </Link>
        <Link href="/boutique" className="border border-line px-5 py-3 text-sm font-bold">
          Continuer mes achats
        </Link>
      </div>
    </main>
  );
}
