
"use client";

import Link from "next/link";
import { useState } from "react";


const links = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];


export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-surface/95 backdrop-blur-lg">
      <div className="sticky top-0 z-50 w-full bg-surface/95">
        <div className="flex h-22 w-full items-center justify-between px-5 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-serif text-[2rem] leading-none tracking-[0.08em] text-brand transition-opacity hover:opacity-80"
            onClick={() => setOpen(false)}
          >
            Art Home Deco
          </Link>

          <nav className="hidden md:block" aria-label="Navigation principale">
            <ul className="flex items-center gap-2 p-1.5 text-sm font-semibold tracking-wide text-foreground">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex px-5 py-2 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-brand md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="w-full bg-surface md:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="flex w-full flex-col px-5 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 text-base font-semibold text-foreground transition-colors hover:text-brand"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

    
        
    
    </nav>
  );
}
