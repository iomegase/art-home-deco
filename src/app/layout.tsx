import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
