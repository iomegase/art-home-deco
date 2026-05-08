import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Art Home Déco",
    template: "%s | Art Home Déco",
  },
  description:
    "Boutique de decoration au style editorial: objets de maison, matieres naturelles et inspirations chaleureuses.",
  icons: {
    icon: [
      { url: "/favicons-package/favicon.ico", sizes: "any" },
      { url: "/favicons-package/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicons-package/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicons-package/favicon-48x48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/favicons-package/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicons-package/favicon.ico"],
  },
  manifest: "/favicons-package/site.webmanifest",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicons-package/mstile-150x150.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&display=swap"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
