import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { createLegalPages } from "@/data/legal-pages";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal)["politique-de-confidentialite"];

  return {
    title: `${page.title} | Art Home Déco`,
    description: page.description,
    alternates: {
      canonical: "/politique-de-confidentialite",
    },
    openGraph: {
      title: `${page.title} | Art Home Déco`,
      description: page.description,
      url: "/politique-de-confidentialite",
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PolitiqueDeConfidentialitePage() {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal)["politique-de-confidentialite"];

  return <LegalPage page={page} />;
}
