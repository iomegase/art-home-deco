import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Art Home Déco",
    template: "%s | Art Home Déco",
  },
  description:
    "Boutique de decoration au style editorial: objets de maison, matieres naturelles et inspirations chaleureuses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
