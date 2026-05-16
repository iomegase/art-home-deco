import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/component/ContactForm";
import {
  buildLocalBusinessJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/local-business";
import { formatOpenDays, formatOpenHours, isStoreOpenNow } from "@/lib/store-status";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteSettings();

  return {
    title: "Contact | Boutique de decoration a Saint-Gervais-les-Bains",
    description:
      `Contactez ${legal.commercialName}, boutique de decoration a Saint-Gervais-les-Bains, pour une demande client, une collaboration ou un conseil en boutique.`,
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      title: "Contact | Art Home Déco",
      description:
        `Contactez ${legal.commercialName}, boutique de decoration a Saint-Gervais-les-Bains, pour une demande client, une collaboration ou un conseil en boutique.`,
      url: "/contact",
    },
  };
}

export default async function ContactPage() {
  const { legal, storeStatus } = await getSiteSettings();
  const localBusinessJsonLd = buildLocalBusinessJsonLd(legal, storeStatus);
  const storeOpen = isStoreOpenNow(storeStatus);

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(localBusinessJsonLd) }}
      />

      <header className="mx-auto max-w-[1240px] px-6 pb-16 pt-20 md:px-16 md:pt-28 lg:px-0">
        <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Contact
        </p>
        <h1 className="text-3xl font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-5xl">
          Boutique de decoration
          <br />
          <span className="text-[#b0a99a]">a Saint-Gervais-les-Bains.</span>
        </h1>
        <p className="mt-10 max-w-[560px] text-[14px] leading-relaxed text-slate-600">
          {legal.commercialName} vous accueille au {legal.address}. Contactez-nous pour une demande client,
          une collaboration createur, un conseil en boutique ou une question sur nos produits.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-16 px-6 pb-20 md:px-16 lg:grid-cols-[1fr_360px] lg:px-0">
        <ContactForm />

        <aside className="space-y-8 border-t border-slate-100 pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#171717]">
              Coordonnees
            </h2>
            <div className="mt-4 space-y-2 text-[14px] leading-7 text-slate-600">
              <p>{legal.commercialName}</p>
              <p>{legal.address}</p>
              <p>{legal.phone}</p>
              <p>{legal.email}</p>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#171717]">
              Horaires boutique
            </h2>
            <div className="mt-4 space-y-2 text-[14px] leading-7 text-slate-600">
              <p>Statut actuel : {storeOpen ? "ouverte" : "fermee"}</p>
              <p>{formatOpenDays(storeStatus.openDays)} - {formatOpenHours(storeStatus)}</p>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#171717]">
              Questions frequentes
            </h2>
            <div className="mt-4 space-y-4 text-[14px] leading-7 text-slate-600">
              <p>
                <strong className="text-[#171717]">Ou se trouve Art Home Déco ?</strong>
                <br />
                La boutique est situee au {legal.address}.
              </p>
              <p>
                <strong className="text-[#171717]">Peut-on acheter en ligne ?</strong>
                <br />
                Oui, une selection de produits est disponible sur la boutique en ligne selon les stocks.
              </p>
              <p>
                <strong className="text-[#171717]">Quels univers propose la boutique ?</strong>
                <br />
                Mobilier, luminaires, senteurs, textiles, objets deco et idees cadeaux selectionnes pour des interieurs chaleureux.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
