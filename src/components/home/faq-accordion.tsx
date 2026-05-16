"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Où se trouve Art Home Déco ?",
    answer: "Art Home Déco est une boutique de décoration située au 96 rue du Mont-Blanc, 74170 Saint-Gervais-les-Bains.",
  },
  {
    question: "Quels produits trouve-t-on chez Art Home Déco ?",
    answer: "La boutique propose une sélection de mobilier, luminaires, linge de maison, vaisselle, senteurs et objets de décoration inspirés de l'art de vivre alpin.",
  },
  {
    question: "Peut-on acheter les produits Art Home Déco en ligne ?",
    answer: "Oui, une sélection de nos articles de décoration et de mobilier est disponible à l'achat directement sur notre site internet, avec un paiement entièrement sécurisé.",
  },
  {
    question: "La boutique propose-t-elle le retrait à Saint-Gervais-les-Bains ?",
    answer: "Absolument. Nous proposons un service gratuit de Click & Collect. Vous pouvez commander en ligne et venir retirer vos achats directement en boutique aux horaires d'ouverture.",
  },
  {
    question: "Livrez-vous les articles de décoration ?",
    answer: "Oui, nous expédions nos articles partout en France. Les frais et délais de livraison dépendent du volume des produits et sont calculés automatiquement lors de la validation de votre panier.",
  },
  {
    question: "Comment savoir si un produit est disponible ?",
    answer: "La disponibilité de chaque article est mise à jour en temps réel sur sa page produit. Si un article est indiqué comme « Épuisé », il ne peut pas être commandé, mais vous pouvez nous contacter pour connaître sa date de réassort.",
  },
  {
    question: "Puis-je contacter la boutique avant de commander ?",
    answer: "Bien sûr ! Notre équipe se fera un plaisir de vous conseiller sur le choix de vos produits, les matières ou les dimensions. Vous pouvez nous joindre via la page Contact de notre site ou par téléphone.",
  },
  {
    question: "Proposez-vous des idées cadeaux ?",
    answer: "Oui, notre sélection est idéale pour offrir (bougies parfumées, beaux livres, petite décoration artisanale...). Nous proposons également des objets intemporels qui font toujours plaisir pour aménager un intérieur.",
  },
  {
    question: "Les produits sont-ils visibles en boutique ?",
    answer: "La grande majorité des articles présentés sur notre site web sont exposés dans notre showroom de Saint-Gervais-les-Bains. Vous pouvez venir les découvrir et apprécier les textures sur place.",
  },
  {
    question: "Où consulter les conditions de retour ?",
    answer: "Vous disposez d'un délai légal de 14 jours pour changer d'avis après réception de votre commande. Toutes les modalités de retour et de remboursement sont détaillées dans nos Conditions Générales de Vente, accessibles en bas de la page.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // On divise le tableau en deux moitiés pour nos 2 colonnes
  const halfLength = Math.ceil(faqs.length / 2);
  const leftColumnFaqs = faqs.slice(0, halfLength);
  const rightColumnFaqs = faqs.slice(halfLength);

  // Fonction pour rendre une colonne (pour éviter de dupliquer le code)
  const renderFaqColumn = (columnFaqs: typeof faqs, startIndexOffset: number) => (
    <div className="flex flex-col border-t border-slate-200">
      {columnFaqs.map((faq, localIndex) => {
        // L'index réel dans le tableau complet "faqs"
        const globalIndex = localIndex + startIndexOffset;
        const isOpen = openIndex === globalIndex;

        return (
          <div key={globalIndex} className="border-b border-slate-200">
            <button
              onClick={() => toggleFaq(globalIndex)}
              className="group flex w-full items-center justify-between py-6 text-left transition-colors hover:text-[#b0a99a]"
              aria-expanded={isOpen}
            >
              <span className={`pr-4 text-[15px] md:text-[17px] tracking-[-0.01em] transition-all duration-300 ${isOpen ? "text-[#b0a99a] font-medium" : "text-[#171717] font-[300]"}`}>
                {faq.question}
              </span>
              
              <div className="ml-2 flex shrink-0 items-center justify-center text-[#171717] group-hover:text-[#b0a99a]">
                {isOpen ? (
                  <Minus className="h-5 w-5 text-[#b0a99a] transition-all duration-300" strokeWidth={1.5} />
                ) : (
                  <Plus className="h-5 w-5 transition-all duration-300" strokeWidth={1.5} />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pr-8 text-[14px] leading-relaxed text-slate-500 md:text-[15px]">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-32 pt-10 md:px-16 lg:px-0">
      <div className="w-full">
        {/* En-tête de la FAQ - Restreint en largeur pour garder un bel aspect */}
        <div className="max-w-[760px]">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">
            FAQ locale
          </p>
         <h2
            className="shrink-0 text-2xl font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-"
            style={{
              fontFamily:
                'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Questions fréquentes  
            <br />
            <span className="text-[#b0a99a]">sur notre boutique de décoration</span>
          </h2>
        </div>

        {/* 
          La Grille à 2 Colonnes 
          Sur mobile (grid-cols-1) : les questions s'empilent.
          Sur desktop (lg:grid-cols-2) : 5 questions à gauche, 5 à droite.
        */}
        <div className="mt-12 grid grid-cols-1 items-start gap-x-12 lg:grid-cols-2 lg:gap-x-24">
          
          {/* Colonne de gauche (Questions 1 à 5) */}
          {renderFaqColumn(leftColumnFaqs, 0)}

          {/* Colonne de droite (Questions 6 à 10) */}
          {renderFaqColumn(rightColumnFaqs, halfLength)}

        </div>
      </div>
    </section>
  );
}