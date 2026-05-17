"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type HeroGraphicProps = {
  imageUrl: string;
  imageAlt: string;
};

export default function HeroGraphic({ imageUrl, imageAlt }: HeroGraphicProps) {
  return (
    <div className="relative mt-8 min-h-[360px] md:mt-12 md:min-h-[460px] lg:mt-0">
      
      {/* FORME 1 : Gauche - Mouvement aller-retour fluide (reverse) */}
      <motion.div
        animate={{
          y: [0, -20],
          x: [0, 10],
          borderRadius: ["50%", "40% 60% 50% 50%"],
        }}
        transition={{ 
          duration: 6, // Durée de l'aller (le retour prendra aussi 6s)
          repeat: Infinity, 
          repeatType: "reverse", // C'est le secret pour une boucle sans cassure !
          ease: "easeInOut" 
        }}
        className="absolute left-[2%] top-[90px] h-[250px] w-[250px] bg-[#f1f1f0] md:left-[14%] md:top-[150px] md:h-[390px] md:w-[390px]"
      />

      {/* FORME 2 : Droite - Parallaxe inversée */}
      <motion.div
        animate={{
          y: [0, 25],
          x: [0, -15],
          borderRadius: ["50%", "50% 50% 40% 60%"],
        }}
        transition={{ 
          duration: 7.5, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
        className="absolute right-[0%] top-[170px] h-[180px] w-[180px] bg-[#f1f1f0] md:right-[3%] md:top-[260px] md:h-[265px] md:w-[265px]"
      />

      {/* FORME 3 : Centre (Ovale) - Respiration */}
      <motion.div
        animate={{
          y: [0, -10],
          scale: [1, 1.03],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
        className="absolute left-[50%] top-0 h-[300px] w-[180px] rounded-[48%] bg-[#f1f1f0] md:left-[54%] md:h-[420px] md:w-[255px]"
      />

      {/* FORME 4 : Le verre dépoli (Glassmorphism) - Flotte indépendamment */}
      <motion.div
        animate={{
          y: [0, 15],
          rotate: [0, 3],
        }}
        transition={{ 
          duration: 9, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
        className="absolute left-[8%] top-[70px] z-10 h-[280px] w-[280px] rounded-full bg-white/45 backdrop-blur-[1px] md:left-[24%] md:top-[110px] md:h-[430px] md:w-[430px]"
      />

      {/* ── IMAGE PRINCIPALE : STRICTEMENT INTACTE (Aucune animation, filtres conservés) ── */}
      <figure className="absolute left-1/2 top-[60px] z-20 h-[340px] w-[230px] -translate-x-1/2 overflow-hidden rounded-[48%] bg-white/10 shadow-[0_45px_90px_rgba(0,0,0,0.08)] md:left-[38%] md:top-[48px] md:h-[520px] md:w-[360px] md:translate-x-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 230px, 360px"
          className="flowerpot-img scale-[1.18] opacity-[0.82] saturate-[0.85] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-white/10 to-white/55 mix-blend-screen" />
        <div className="lamp-glow-breathe pointer-events-none absolute left-[44%] top-[70%] z-30 h-[34%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4e4b7]/60 blur-2xl" />
        <div className="lamp-glow-flicker pointer-events-none absolute left-[44%] top-[58%] z-30 h-[34%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f9edd0]/55 blur-[34px]" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-2xl" />
      </figure>

    </div>
  );
}