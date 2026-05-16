"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LegalSettings, StoreStatusSettings } from "@/features/admin-home/types";
import { formatOpenDays, formatOpenHours, isStoreOpenNow } from "@/lib/store-status";
import { trackEmailClick, trackPhoneClick } from "@/lib/analytics/events";

const navBoutique = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Journal", href: "/blog" },

  { label: "Contact", href: "/contact" },
];

const navInfo = [
  { label: "Données personnelles", href: "/donnees-personnelles" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "CGU", href: "/cgu" },
  { label: "Confidentialité", href: "/politique-de-confidentialite" },
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

export function SiteFooter({
  legal,
  storeStatus,
}: {
  legal: LegalSettings;
  storeStatus: StoreStatusSettings;
}) {
  const currentYear = new Date().getFullYear();
  const commercialName = legal.commercialName;
  const legalAddress = legal.address;
  const legalEmail = legal.email;
  const legalPhone = legal.phone;
  const siret = legal.siren;
  const vatNumber = legal.vat;

  const telHref = `tel:${legalPhone.replace(/\s+/g, "")}`;
  const mailHref = `mailto:${legalEmail}`;
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const openDaysText = formatOpenDays(storeStatus.openDays);
  const openHoursText = formatOpenHours(storeStatus);

  const footerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateStoreOpenState = () => {
      setIsStoreOpen(isStoreOpenNow(storeStatus));
    };

    updateStoreOpenState();
    const timer = setInterval(updateStoreOpenState, 60_000);
    return () => clearInterval(timer);
  }, [storeStatus]);

  const col = (delay: string) =>
    `transition-all duration-700 ease-out ${delay} ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    }`;

  return (
    <footer className="bg-white">
      <div
        ref={footerRef}
        className="mx-auto max-w-310 px-6 py-20 md:px-16 md:py-28 lg:px-0"
      >
        {/* ── Brand ── */}
        <div className={`flex flex-col gap-4 ${col("delay-[0ms]")}`}>
          <div className="flex flex-row items-center gap-3">
            <Link
              href="/"
              className="relative block h-10 w-10 opacity-80 transition-opacity duration-300 hover:opacity-100"
            >
              <Image
                src="/logo.png"
                alt="Art Home Déco"
                width={40}  
                height={40}
                className="object-contain "
              />
            </Link>
            <div className="relative flex items-center">
              <h2 className="text-2xl font-light leading-[0.9] tracking-[-0.04em] text-[#171717] ">
                {commercialName}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[12px] font-black uppercase tracking-wider "> 
            <address className="not-italic ">
              {legalAddress}
            </address>
            <ContactLink
              href={telHref}
              onClick={() => trackPhoneClick()}
            
            >
              {legalPhone}
            </ContactLink>
            <ContactLink
              href={mailHref}
              onClick={() => trackEmailClick()}
            >
              {legalEmail}
            </ContactLink>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#171717]">
              <span className={`h-2.5 w-2.5 rounded-full ${isStoreOpen ? "bg-green-500" : "bg-red-500"}`} />
              Boutique de decoration a Saint-Gervais-les-Bains
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#171717]">
              Statut actuel : {isStoreOpen ? "ouverte" : "fermee"}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6b7280]">
              Horaires : {openDaysText} - {openHoursText}
            </p>
          </div>
        </div>

        {/* ── Bas du footer : nav + copyright ── */}
        <div
          className={`mt-10 border-t border-[#e5e7eb] pt-8 ${col("delay-150")}`}
        >
          {/* Nav horizontale */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Navigation
              </p>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {navBoutique.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    className="text-[10px] tracking-[0.12em]"
                  >
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
                  <NavLink
                    key={item.href}
                    href={item.href}
                    className="text-[10px] tracking-[0.12em]"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div
            className={`mt-10 flex flex-col gap-4 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:items-center sm:justify-between ${col("delay-[300ms]")}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
              © {currentYear} Art Home Déco
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] font-light uppercase tracking-[0.12em] text-[#5b4321]">
              {siret && <span>SIRET {siret}</span>}
              {vatNumber && <span>TVA {vatNumber}</span>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
