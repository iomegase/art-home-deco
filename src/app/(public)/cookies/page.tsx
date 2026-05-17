import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { createLegalPages } from "@/data/legal-pages";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cookies;

  return {
    title: `${page.title} | Art Home Déco`,
    description: page.description,
    alternates: {
      canonical: "/cookies",
    },
    openGraph: {
      title: `${page.title} | Art Home Déco`,
      description: page.description,
      url: "/cookies",
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CookiesPage() {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cookies;

  return <LegalPage page={page} />;
}
