import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description:
    "Informations de livraison et retours Art Home Déco: modes de retrait, expédition et conditions de retour.",
  alternates: {
    canonical: "/livraison-retours",
  },
  openGraph: {
    title: "Livraison et retours | Art Home Déco",
    description:
      "Consultez les conditions de livraison, retrait boutique et retours pour vos commandes Art Home Déco.",
    url: "/livraison-retours",
    type: "article",
  },
};

export default function Page() {
  return <section className="mx-auto max-w-6xl px-6 py-16">Page en construction.</section>;
}
