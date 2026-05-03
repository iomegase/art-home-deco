"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { getCartItemCount } from "@/features/cart/count";
import { readCart } from "@/features/cart/storage";

const links = [
  { href: "/boutique", label: "Shop" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const closeMenu = () => setIsOpen(false);

  // Bloquer le scroll du site quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

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
    <header className="sticky top-0 z-[100] border-b border-line/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        
        {/* LOGO */}
        <NextLink href="/" className="z-[120] transition-opacity hover:opacity-80" onClick={closeMenu}>
          <Image
            src="/logo.png"
            alt="Art Home Deco"
            width={120}
            height={40}
            className="h-8 w-auto md:h-9"
            priority
          />
        </NextLink>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            {links.map((link) => (
              <li key={link.href}>
                <NextLink href={link.href} className="transition-colors hover:text-terracotta">
                  {link.label}
                </NextLink>
              </li>
            ))}
            <li>
              <NextLink href="/panier" className="rounded-full bg-foreground px-5 py-2 text-[10px] text-background">
                PANIER ({cartItemCount})
              </NextLink>
            </li>
          </ul>
        </nav>

        {/* BOUTON BURGER (Z-INDEX 120 pour rester au-dessus de tout) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-[120] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden focus:outline-none"
          aria-label="Menu"
        >
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>

        {/* MENU MOBILE OVERLAY */}
        <div
          className={`fixed inset-0 z-[110] flex h-screen w-screen flex-col items-center justify-center bg-white/70 backdrop-blur-2xl transition-all duration-500 md:hidden ${
            isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* Conteneur des liens centré verticalement et horizontalement */}
          <nav className="flex flex-col items-center justify-center gap-12 text-center">
            {links.map((link, index) => (
              <NextLink
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`text-4xl font-serif tracking-tight text-foreground transition-all duration-700 ${
                  isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {link.label}
              </NextLink>
            ))}
            
            <div 
               className={`mt-6 transition-all duration-700 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${links.length * 100}ms` }}
            >
              <NextLink
                href="/panier"
                onClick={closeMenu}
                className="rounded-full border border-foreground px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-colors active:bg-foreground active:text-white"
              >
                Panier ({cartItemCount})
              </NextLink>
            </div>
          </nav>
        </div>

      </div>
    </header>
  );
}
