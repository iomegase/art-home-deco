import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Panier",
  description: "Consultez votre panier Art Home Déco avant validation de votre commande.",
  alternates: {
    canonical: "/panier",
  },
  openGraph: {
    title: "Panier | Art Home Déco",
    description: "Retrouvez les articles sélectionnés dans votre panier Art Home Déco.",
    url: "/panier",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16 md:mt-10">
      <header className="mb-10  pb-8">
        <p className="section-title text-terracotta">Commande</p>
        <h1 className="mt-3 text-5xl font-thin! leading-none md:text-7xl">Panier</h1>
      </header>
      <CartView />
    </main>
  );
}
