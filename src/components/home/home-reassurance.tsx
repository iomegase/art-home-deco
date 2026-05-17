"use client";

import {
 ShieldCheck,
MapPin,
PackageCheck,
MessagesSquare,
} from "lucide-react";

const reassuranceItems = [
  {
    icon: ShieldCheck,
    label: "Paiement sécurisé",
    text: "Transactions protégées par Stripe.",
  },
  {
    icon: MapPin,
    label: "Retrait en boutique",
    text: "Commande en ligne, retrait à Saint-Gervais-les-Bains.",
  },
  {
    icon: PackageCheck,
    label: "Livraison adaptée",
    text: "Selon le format, le poids et la disponibilité des articles.",
  },
  {
    icon: MessagesSquare,
    label: "Conseil personnalisé",
    text: "Une question ? La boutique vous accompagne directement.",
  },
];

export function HomeReassurance() {
  return (
   <section className=" bg-[#b0a99a]/10 relative z-10 w-full py-12 md:py-16">
      <div className="mx-auto grid max-w-[1250px] grid-cols-2 gap-4 px-6 md:px-16 md:grid-cols-4 lg:gap-6 lg:px-0 ">
        {reassuranceItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="group relative flex min-h-[160px] flex-col justify-between  bg-white/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-bl-2xl rounded-br-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-[#b0a99a] transition-transform duration-500 ease-out group-hover:scale-x-100 "  />

              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#b0a99a] shadow-sm transition-colors duration-500 group-hover:bg-[#b0a99a] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>

                <h3 className="text-[11px] font-bold! uppercase leading-snug tracking-[0.16em] text-[#171717]">
                  {item.label}
                </h3>
              </div>

              <p className="mt-5 text-[10px] leading-widest! tracking-widest text-slate-500 uppercase transition-colors duration-300 group-hover:text-slate-700">
                {item.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
