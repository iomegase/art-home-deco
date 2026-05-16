import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutique decoration Saint-Gervais-les-Bains",
  description:
    "Art Home Déco est une boutique de decoration a Saint-Gervais-les-Bains, au pied du Mont-Blanc, avec une selection de mobilier, luminaires, senteurs et objets deco.",
  alternates: {
    canonical: "/boutique-decoration-saint-gervais-les-bains",
  },
};

export default function LocalSeoLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-[1240px] px-6 pb-20 pt-24 md:px-16 lg:px-0">
        <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Saint-Gervais-les-Bains
        </p>
        <h1 className="max-w-[760px] text-[42px] font-thin leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-[64px]">
          Boutique de decoration
          <br />
          <span className="text-[#b0a99a]">a Saint-Gervais-les-Bains</span>
        </h1>
        <p className="mt-8 max-w-[760px] text-[15px] leading-8 text-slate-600">
          Art Home Déco selectionne mobilier, luminaires, senteurs, textiles et objets deco pour des
          interieurs chaleureux inspires des Alpes. La boutique est situee au coeur de Saint-Gervais-les-Bains,
          au pied du Mont-Blanc.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-10 border-t border-slate-100 px-6 py-16 md:px-16 lg:grid-cols-2 lg:px-0">
        <div>
          <h2 className="text-[28px] font-[300] tracking-[-0.03em] text-[#171717] md:text-[36px]">
            Une adresse deco en Haute-Savoie
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-8 text-slate-600">
            <p>
              La boutique accueille les habitants de Saint-Gervais-les-Bains, les proprietaires de chalets,
              les visiteurs du pays du Mont-Blanc et les amateurs d’interieurs apaises.
            </p>
            <p>
              Vous y trouverez une selection de pieces pour la maison : luminaires, petits meubles, senteurs,
              linge, idees cadeaux et objets deco choisis pour leur caractere et leur qualite.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-[300] tracking-[-0.03em] text-[#171717] md:text-[36px]">
            Questions frequentes
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-8 text-slate-600">
            <p>
              <strong className="text-[#171717]">Ou acheter de la decoration a Saint-Gervais-les-Bains ?</strong>
              <br />
              Art Home Déco propose une selection de produits pour la maison au 96 rue du Mont-Blanc.
            </p>
            <p>
              <strong className="text-[#171717]">Peut-on acheter en ligne ?</strong>
              <br />
              Oui, une partie de la selection est disponible sur la boutique en ligne selon les stocks.
            </p>
            <p>
              <strong className="text-[#171717]">Quels produits trouve-t-on en boutique ?</strong>
              <br />
              Mobilier, luminaires, textiles, senteurs, objets deco et idees cadeaux.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 py-16">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-6 md:px-16 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <h2 className="text-[28px] font-[300] tracking-[-0.03em] text-[#171717] md:text-[36px]">
            Decouvrir la selection Art Home Déco
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/boutique"
              className="inline-flex h-[46px] items-center justify-center bg-[#171717] px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b0a99a]"
            >
              Voir la boutique
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-[46px] items-center justify-center border border-[#171717] px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
