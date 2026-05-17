import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { createLegalPages } from "@/data/legal-pages";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cgu;

  return {
    title: `${page.title} | Art Home Déco`,
    description: page.description,
    alternates: {
      canonical: "/cgu",
    },
    openGraph: {
      title: `${page.title} | Art Home Déco`,
      description: page.description,
      url: "/cgu",
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CguPage() {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cgu;

  return <LegalPage page={page} />;
}
