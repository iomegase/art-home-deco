import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalisez votre commande Art Home Déco en toute sécurité.",
  alternates: {
    canonical: "/checkout",
  },
  openGraph: {
    title: "Checkout | Art Home Déco",
    description: "Validation et paiement sécurisé de votre commande Art Home Déco.",
    url: "/checkout",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <header className="mb-10 border-b border-line pb-8">
        <p className="section-title text-terracotta">Paiement</p>
        <h1 className="mt-3 text-5xl leading-none md:text-7xl">Checkout</h1>
      </header>
      <Suspense fallback={<p className="text-muted">Chargement du checkout...</p>}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
