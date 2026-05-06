"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { trackEmailClick, trackPhoneClick } from "@/lib/analytics/events";
import { Phone, Mail } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const siret = process.env.NEXT_PUBLIC_COMPANY_SIRET;
  const vatNumber = process.env.NEXT_PUBLIC_COMPANY_VAT;

  return (
    <footer className="border-t border-line/50 bg-background pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-4">
          
          {/* COLONNE 1 : LOGO & ADRESSE */}
          <div className="flex flex-col gap-6 md:col-span-1 lg:col-span-2">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/logo.png"
                alt="Art Home Déco"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="flex gap-3">
              
                <p>
                  <strong className="block text-foreground font-medium mb-1 uppercase tracking-wider text-xs">Art Home Déco</strong>
                  96 rue du Mont Blanc<br />
                  74170 Saint-Gervais-les-Bains
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* TÉLÉPHONE */}
                <a 
                  href="tel:+33607859058" 
                  onClick={() => trackPhoneClick()}
                  className="flex items-center gap-3 transition-colors hover:text-terracotta"
                >
                  <Phone size={16} className="text-foreground/50" />
                  <span>06 07 85 90 58</span>
                </a>

                {/* EMAIL */}
                <a 
                  href="mailto:contact@arthome.com" 
                  onClick={() => trackEmailClick()}
                  className="flex items-center gap-3 transition-colors hover:text-terracotta"
                >
                  <Mail size={16} className="text-foreground/50" />
                  <span>contact@arthome.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* COLONNE 2 : MENU PRINCIPAL */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40">Navigation</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/boutique" className="transition-colors hover:text-terracotta">La boutique</Link>
              <Link href="/blog" className="transition-colors hover:text-terracotta">Journal d&apos;Inspirations</Link>
              <Link href="/contact" className="transition-colors hover:text-terracotta">Contact</Link>
            
            </nav>
          </div>

          {/* COLONNE 3 : JURIDIQUE */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40">Informations</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/mentions-legales" className="transition-colors hover:text-terracotta">Mentions Légales</Link>
              <Link href="/cgv" className="transition-colors hover:text-terracotta">CGV</Link>
              <Link href="/cgu" className="transition-colors hover:text-terracotta">CGU</Link>
              <Link href="/politique-confidentialite" className="transition-colors hover:text-terracotta">Confidentialité</Link>
            </nav>
          </div>
        </div>

        {/* BARRE INFÉRIEURE : COPYRIGHT & INFOS LÉGALES */}
        <div className="mt-20 border-t border-line/30 pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
            © {currentYear} Art Home Déco. Tous droits réservés.
          </p>
          
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">
            {siret ? <p>SIRET : {siret}</p> : null}
            {vatNumber ? <p>TVA : {vatNumber}</p> : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
