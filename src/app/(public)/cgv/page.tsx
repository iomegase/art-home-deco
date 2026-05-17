import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { createLegalPages } from "@/data/legal-pages";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cgv;

  return {
    title: `${page.title} | Art Home Déco`,
    description: page.description,
    alternates: {
      canonical: "/cgv",
    },
    openGraph: {
      title: `${page.title} | Art Home Déco`,
      description: page.description,
      url: "/cgv",
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CgvPage() {
  const { legal } = await getSiteSettings();
  const page = createLegalPages(legal).cgv;

  return <LegalPage page={page} />;
}
