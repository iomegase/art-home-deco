import { Leaf, Lightbulb, MapPinned, Sparkles, LucideIcon } from "lucide-react";

type HomeCommitmentsProps = {
  label: string;
  title: string;
  paragraph: string;
};

type CommitmentItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const COMMITMENT_ITEMS: CommitmentItem[] = [
  {
    icon: Lightbulb,
    title: "Sélection exigeante",
    text: "Des pièces choisies pour leur ligne, leur matière et leur présence dans l'espace.",
  },
  {
    icon: MapPinned,
    title: "Conseil en boutique",
    text: "Un accompagnement simple pour composer une maison cohérente, chaleureuse et vivante.",
  },
  {
    icon: Sparkles,
    title: "Inspiration alpine",
    text: "Une sensibilité déco nourrie par la lumière, les textures et l'art de vivre du pays du Mont-Blanc.",
  },
  {
    icon: Leaf,
    title: "Objets durables",
    text: "Des collections choisies pour traverser les saisons avec justesse plutôt que suivre un effet de mode.",
  },
];

function CommitmentCard({ icon: Icon, title, text }: CommitmentItem) {
  return (
    <article className="group rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors duration-300 group-hover:bg-stone-200 group-hover:text-stone-700">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">
          {title}
        </h3>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {text}
      </p>
    </article>
  );
}

export function HomeCommitments({
  label,
  title,
  paragraph,
}: HomeCommitmentsProps) {
  return (
    <>
      <section className="mx-auto max-w-[1240px] px-6 pt-26 md:px-16 md:pt-10 lg:px-0">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_480px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
              {label}
            </p>
            <h2 className="mt-4 max-w-[680px] text-4xl font-light leading-[0.95] tracking-[-0.05em] text-neutral-900 md:text-5xl lg:text-[54px]">
              {title}
            </h2>
          </div>

          <div className="lg:flex lg:items-center lg:pl-10">
            <p className="max-w-[520px] text-base leading-relaxed text-slate-600 md:text-lg">
              {paragraph}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-20 pt-10 md:px-16 md:pb-24 md:pt-12 lg:px-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {COMMITMENT_ITEMS.map((item) => (
            <CommitmentCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </>
  );
}
