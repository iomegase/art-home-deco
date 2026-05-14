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

const secondaryLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
];

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isVisibleOnScroll, setIsVisibleOnScroll] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);
  const isActiveLink = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

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

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setIsVisibleOnScroll(currentY > 20 || isOpen);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ${
        isVisibleOnScroll ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-white/40 bg-white/70 px-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:px-6 lg:px-10">
        <NextLink href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 lg:mr-10" onClick={closeMenu}>
          <span className="relative block h-9 w-[36px] sm:w-[120px]">
            <Image
              src="/logo.png"
              alt="Art Home Déco"
              fill
              sizes="(max-width: 640px) 36px, 120px"
              className="object-contain object-left"
              priority
            />
          </span>
          {/* <span className="text-[14px] font-semibold tracking-[0.01em] text-[#171717] sm:hidden">Art Home Déco</span> */}
        </NextLink>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Navigation principale">
          {primaryLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className={`text-[11px]! font-bold uppercase! tracking-[0.16em]! transition-colors! ${
                isActiveLink(link.href) ? "text-[#171717]!" : "text-[#171717]/70! hover:text-[#171717]!"
              }`}
            >
              {link.label}
            </NextLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 text-[#171717] lg:flex">
        

   

          <NextLink href="/panier" className="flex items-center gap-3 border-l border-black/10 pl-5">
           
              <ShoppingCart className=" h-7 w-7 bg-white text-[#171717]"  />
          
          
          </NextLink>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-[120] ml-2 inline-flex h-11 w-11 items-center justify-center border-l border-black/20 pl-3 focus:outline-none lg:hidden"
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="mobile-main-nav"
        >
          <span
            className={`absolute h-px w-5 bg-[#171717] transition-all duration-200 ${
              isOpen ? "rotate-45" : "-translate-y-[4px]"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-[#171717] transition-all duration-200 ${
              isOpen ? "-rotate-45" : "translate-y-[4px]"
            }`}
          />
        </button>

        <div
          id="mobile-main-nav"
          className={`fixed inset-x-0 top-[72px] z-[110] h-[calc(100dvh-72px)] overflow-y-auto border-b border-white/40 bg-white/75 px-6 pb-8 pt-6 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl lg:hidden ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <nav className="flex min-h-full flex-col gap-2" aria-label="Navigation mobile principale">
            {primaryLinks.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-xl px-3 py-3 text-base font-semibold tracking-[0.01em] transition-colors hover:bg-black/[0.03] ${
                  isActiveLink(link.href) ? "bg-black/[0.04] text-[#171717]" : "text-[#171717]"
                }`}
              >
                {link.label}
              </NextLink>
            ))}

            <div className="my-4 h-px w-full bg-black/10" />

            <NextLink
              href="/panier"
              onClick={closeMenu}
              className="inline-flex w-fit items-center rounded-full border border-foreground px-6 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition-colors active:bg-foreground active:text-white"
            >
              Panier ({cartItemCount})
            </NextLink>

            <div className="mt-auto border-t border-black/10 pt-5">
              <div className="sticky bottom-0 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.12em] text-foreground/70">
                  {secondaryLinks.map((link) => (
                    <NextLink key={link.href} href={link.href} onClick={closeMenu}>
                      {link.label}
                    </NextLink>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
