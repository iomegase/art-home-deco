"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/features/cart/count";
import { readCart } from "@/features/cart/storage";

const primaryLinks = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const isVisibleOnScroll = true;
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);
  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  // Bloquer le scroll du site quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Synchronisation du panier
  useEffect(() => {
    const syncCartCount = () => {
      setCartItemCount(getCartItemCount(readCart()));
    };

    syncCartCount();
    window.addEventListener("cart-updated", syncCartCount);
    window.addEventListener("storage", syncCartCount);

    return () => {
      window.removeEventListener("cart-updated", syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  return (
    <>
      {/* HEADER FLOTTANT (Desktop & Mobile) */}
      <header
        className={`fixed inset-x-0 top-0 z-[100] px-4 pt-4 sm:px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisibleOnScroll ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/40 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md backdrop-saturate-150 transition-colors hover:bg-white/50 lg:px-8">
          
          {/* LOGO */}
        {/* LOGO & NOM DE L'ENTREPRISE */}
          <NextLink
            href="/"
            className="group relative flex items-center gap-3 transition-opacity duration-300 hover:opacity-70"
            onClick={closeMenu}
          >
            {/* L'icône du flocon (j'ai ajusté la taille pour qu'elle soit carrée) */}
            <span className="relative block h-7 w-7 sm:h-8 sm:w-8">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </span>
            
            {/* Le texte : Masqué sur les tous petits écrans pour ne pas casser la nav, visible à partir de 'sm' */}
            <span className="hidden sm:flex items-center gap-1.5 text-[1.1rem] tracking-wide">
              <span className="font-light text-black">Art Home</span>
              {/* J'ai pris une couleur taupe qui se rapproche du 'Déco' de ton image */}
              <span className="font-light text-[#B8A795]">Déco</span>
            </span>
          </NextLink>

          {/* LIENS DESKTOP */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
            {primaryLinks.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                className={`group relative py-2 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActiveLink(link.href) ? "text-black" : "text-black/60 hover:text-black"
                }`}
              >
                {link.label}
                {/* Ligne d'animation au survol */}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-black transition-transform duration-300 ease-out ${
                    isActiveLink(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </NextLink>
            ))}
          </nav>

          {/* PANIER & BOUTON MENU */}
          <div className="flex items-center gap-4">
            <NextLink
              href="/panier"
              className="group relative flex items-center justify-center p-2 transition-transform hover:scale-110"
              aria-label="Voir le panier"
            >
              <ShoppingCart className="h-5 w-5 text-black/80 transition-colors group-hover:text-black" />
              {/* Badge du panier élégant */}
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-110">
                {cartItemCount}
              </span>
            </NextLink>

            {/* HAMBURGER MOBILE */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/50 transition-colors hover:bg-white lg:hidden"
              aria-label="Menu"
              aria-expanded={isOpen}
              aria-controls="mobile-main-nav"
            >
              <div className="flex w-4 flex-col items-end gap-1.5">
                <span
                  className={`h-[1.5px] bg-black transition-all duration-300 ${
                    isOpen ? "w-4 translate-y-[7px] rotate-45" : "w-4"
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-black transition-all duration-300 ${
                    isOpen ? "w-0 opacity-0" : "w-3"
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-black transition-all duration-300 ${
                    isOpen ? "w-4 -translate-y-[7px] -rotate-45" : "w-4"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY MENU MOBILE (Plein écran flouté) */}
      <div
        id="mobile-main-nav"
        className={`fixed inset-0 z-[120] bg-white/70 backdrop-blur-2xl transition-all duration-500 ease-in-out lg:hidden ${
          isOpen ? "visible opacity-100 pointer-events-auto" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-center px-8 pb-20 pt-32">
          <nav className="flex flex-col gap-6" aria-label="Navigation mobile principale">
            {primaryLinks.map((link, index) => (
              <NextLink
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                style={{ transitionDelay: `${isOpen ? index * 50 : 0}ms` }}
                className={`text-[2rem] font-medium tracking-tight text-black transition-all duration-500 hover:opacity-70 ${
                  isOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                } ${isActiveLink(link.href) ? "font-bold" : ""}`}
              >
                {link.label}
              </NextLink>
            ))}

            <div 
              style={{ transitionDelay: `${isOpen ? primaryLinks.length * 50 : 0}ms` }}
              className={`mt-8 h-px w-full bg-black/10 transition-all duration-500 ${
                isOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`} 
            />

            <NextLink
              href="/panier"
              onClick={closeMenu}
              style={{ transitionDelay: `${isOpen ? (primaryLinks.length + 1) * 50 : 0}ms` }}
              className={`inline-flex w-fit items-center gap-3 rounded-full bg-black px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              Panier
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/20 px-2 text-xs">
                {cartItemCount}
              </span>
            </NextLink>
          </nav>
        </div>
      </div>
    </>
  );
}
