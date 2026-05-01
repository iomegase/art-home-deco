import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav} from "@/components/layout/site-nav";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arthomedeco.fr"),
  title: {
    default: "Art Home Deco",
    template: "%s | Art Home Deco",
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
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <SiteNav />
        <SiteHeader/>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
