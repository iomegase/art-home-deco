"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { trackEmailClick, trackPhoneClick } from "@/lib/analytics/events";

const navBoutique = [
  { label: "Boutique", href: "/boutique" },
  { label: "Journal", href: "/blog" },
  { label: "Livraison & Retours", href: "/livraison-et-retours" },
  { label: "Contact", href: "/contact" },
];

const navInfo = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV & Livraison", href: "/cgv" },
  { label: "Confidentialité", href: "/politique-confidentialite" },
];

function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative w-fit font-bold uppercase text-[#171717]/50 transition-colors duration-300 hover:text-[#171717] ${className ?? "text-[13px] tracking-[0.12em]"}`}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#171717] transition-[width] duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}

function ContactLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group relative w-fit transition-colors duration-300 hover:text-[#171717]"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#b0a99a] transition-[width] duration-300 ease-out group-hover:w-full" />
    </a>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const siret = process.env.NEXT_PUBLIC_COMPANY_SIRET;
  const vatNumber = process.env.NEXT_PUBLIC_COMPANY_VAT;

  const footerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const col = (delay: string) =>
    `transition-all duration-700 ease-out ${delay} ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    }`;

  return (
    <footer className="bg-white">
      <div
        ref={footerRef}
        className="mx-auto max-w-[1240px] px-6 py-20 md:px-16 md:py-28 lg:px-0"
      >
        {/* ── Brand ── */}
        <div className={`flex flex-col gap-12 ${col("delay-[0ms]")}`}>
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="relative block h-9 w-[120px] opacity-80 transition-opacity duration-300 hover:opacity-100"
            >
              <Image
                src="/logo.png"
                alt="Art Home Déco"
                fill
                sizes="120px"
                className="object-contain object-left"
              />
            </Link>

            <h2 className="text-[52px] font-[300] leading-[0.9] tracking-[-0.04em] text-[#171717] md:text-[72px]">
              Art Home
              <br />
              <span className="text-[#b0a99a]">Déco.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[#b0a99a]">
            <address className="not-italic leading-6">
              96 rue du Mont Blanc
              <br />
              74170 Saint-Gervais-les-Bains
            </address>
            <ContactLink href="tel:+33607859058" onClick={() => trackPhoneClick()}>
              06 07 85 90 58
            </ContactLink>
            <ContactLink href="mailto:contact@arthome.com" onClick={() => trackEmailClick()}>
              contact@arthome.com
            </ContactLink>
          </div>
        </div>

        {/* ── Bas du footer : nav + copyright ── */}
        <div className={`mt-20 border-t border-[#e5e7eb] pt-8 ${col("delay-[150ms]")}`}>

          {/* Nav horizontale */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Navigation
              </p>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {navBoutique.map((item) => (
                  <NavLink key={item.href} href={item.href} className="text-[10px] tracking-[0.12em]">
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Informations
              </p>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {navInfo.map((item) => (
                  <NavLink key={item.href} href={item.href} className="text-[10px] tracking-[0.12em]">
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className={`mt-10 flex flex-col gap-4 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:items-center sm:justify-between ${col("delay-[300ms]")}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
              © {currentYear} Art Home Déco
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">
              {siret && <span>SIRET {siret}</span>}
              {vatNumber && <span>TVA {vatNumber}</span>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
