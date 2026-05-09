"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { trackEmailClick, trackPhoneClick } from "@/lib/analytics/events";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const siret = process.env.NEXT_PUBLIC_COMPANY_SIRET;
  const vatNumber = process.env.NEXT_PUBLIC_COMPANY_VAT;

  return (
    <footer className="relative flex min-h-[100svh] flex-col overflow-hidden border-t border-white/40 bg-white/40 text-[#171717] shadow-[0_-20px_50px_rgba(0,0,0,0.02)] backdrop-blur-3xl">
      {/* Décors d'arrière-plan pour révéler l'effet verre dépoli */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 to-white/70" />
      <div className="pointer-events-none absolute -left-[10%] top-[10%] -z-10 h-[400px] w-[400px] rounded-full bg-slate-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -right-[10%] bottom-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-[#e6c78f]/20 blur-[120px]" />

      <Container>
        <div className="flex min-h-[100svh] flex-col justify-between py-16 md:py-24">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
          
            {/* BRAND & CONTACT */}
            <div className="flex flex-col gap-10 md:col-span-6 lg:col-span-5">
              <Link href="/" className="group relative block h-10 w-[140px] transition-transform duration-500 hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Art Home Déco"
                  fill
                  sizes="140px"
                  className="object-contain object-left opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                />
              </Link>
            
              <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-[#171717]/70">
                <address className="not-italic transition-colors duration-300 hover:text-[#171717]">
                96 rue du Mont Blanc<br />
                74170 Saint-Gervais-les-Bains
              </address>

                <div className="flex flex-col gap-4">
                <a 
                  href="tel:+33607859058" 
                  onClick={() => trackPhoneClick()}
                  className="group flex w-fit items-center transition-all duration-300 hover:text-[#171717]"
                >
                    <span className="mr-3 font-bold tracking-[0.08em] text-[#171717] transition-transform duration-300 group-hover:-translate-y-1">T.</span> 
                    <span className="relative overflow-hidden">
                      06 07 85 90 58
                      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#171717] transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                </a>

                <a 
                  href="mailto:contact@arthome.com" 
                  onClick={() => trackEmailClick()}
                  className="group flex w-fit items-center transition-all duration-300 hover:text-[#171717]"
                >
                    <span className="mr-3 font-bold tracking-[0.08em] text-[#171717] transition-transform duration-300 group-hover:-translate-y-1">M.</span> 
                    <span className="relative overflow-hidden">
                      contact@arthome.com
                      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#171717] transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                </a>
              </div>
            </div>
          </div>

            {/* NAVIGATION */}
            <div className="flex flex-col gap-8 md:col-span-3 lg:col-span-3 lg:col-start-7">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717]">Boutique</h3>
              <nav className="flex flex-col gap-5 text-[13px] text-[#171717]/70">
                {[
                  { label: 'Shop', href: '/boutique' },
                  { label: 'Journal', href: '/blog' },
                  { label: 'Contact', href: '/contact' }
                ].map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    className="group flex w-fit items-center transition-colors hover:text-[#171717]"
                  >
                    <span className="h-px w-0 bg-[#171717] transition-all duration-300 group-hover:mr-3 group-hover:w-3" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                  </Link>
                ))}
            </nav>
          </div>

            {/* INFORMATIONS */}
            <div className="flex flex-col gap-8 md:col-span-3 lg:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717]">Informations</h3>
              <nav className="flex flex-col gap-5 text-[13px] text-[#171717]/70">
                {[
                  { label: 'Mentions Légales', href: '/mentions-legales' },
                  { label: 'CGV & Livraison', href: '/cgv' },
                  { label: 'Confidentialité', href: '/politique-confidentialite' }
                ].map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    className="group flex w-fit items-center transition-colors hover:text-[#171717]"
                  >
                    <span className="h-px w-0 bg-[#171717] transition-all duration-300 group-hover:mr-3 group-hover:w-3" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                  </Link>
                ))}
            </nav>
          </div>
        </div>

            {/* BOTTOM BAR */}
            <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 md:mt-auto md:flex-row">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#171717]/50 transition-opacity duration-300 hover:text-[#171717]/80">
            © {currentYear} Art Home Déco.
          </p>
          
              <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-[0.16em] text-[#171717]/50">
                {siret ? <p className="transition-opacity duration-300 hover:text-[#171717]/80">SIRET : {siret}</p> : null}
                {vatNumber ? <p className="transition-opacity duration-300 hover:text-[#171717]/80">TVA : {vatNumber}</p> : null}
              </div>
            </div>
          </div>
      </Container>
    </footer>
  );
}
