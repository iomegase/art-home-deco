"use client";
import { ButtonLink } from "@/components/ui/button-link";

export function SiteHeader() {
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#e6c78f]">
      {/* Image background */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1683129618086-4c87d263b48b?q=80&w=3192&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />

      {/* Overlay global */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1f2f47]/55 via-[#1f2f47]/20 to-transparent" />

      {/* Overlay bas pour profondeur */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />

      <div className="mx-auto flex min-h-[760px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-[720px] rounded-[44px] border border-white/30 bg-white/18 p-7 text-white shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10 lg:p-12">
          <p className="section-title text-white/75">
            Nouvelle collection capsule
          </p>

          <h1 className="mt-5 max-w-2xl text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Design sculptural pour intérieurs modernes.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            Une sélection d&apos;objets avec silhouettes organiques, tons corail
            et lignes minérales pour une ambiance signature.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/boutique">Découvrir la collection</ButtonLink>

            <ButtonLink href="/blog" variant="ghost">
              Voir l&apos;univers
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
