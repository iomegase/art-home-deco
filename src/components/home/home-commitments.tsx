import {
  Truck,
  Store,
  ShieldCheck,
  Sparkles,
  MessagesSquare,
  PackageSearch,
  type LucideIcon,
} from "lucide-react";

type HomeCommitmentsProps = {
  label: string;
  title: string;
  paragraph: string;
  items: {
    title: string;
    text: string;
  }[];
};

type CommitmentItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const commitmentIcons: LucideIcon[] = [
  Sparkles,
  ShieldCheck,
  Store,
  Truck,
  PackageSearch,
  MessagesSquare,
];

export function HomeCommitments({
  label,
  title,
  paragraph,
  items,
}: HomeCommitmentsProps) {
  const commitments: CommitmentItem[] = items
    .slice(0, commitmentIcons.length)
    .map((item, index) => ({
      ...item,
      icon: commitmentIcons[index] ?? Sparkles,
    }));

  return (
    <section className="relative z-10 w-full py-20 md:py-24  bg-[#b0a99a]/10 ">
      <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
        <div className="mb-10 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_480px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">
              {label}
            </p>

            <h2 className="mt-5 max-w-[620px] text-3xl font-light leading-[0.95] tracking-[-0.05em] text-[#171717] md:text-4xl">
              {title}
            </h2>
          </div>

          <div className="lg:flex lg:items-center lg:pl-10">
            <p className="max-w-[480px] text-[14px] italic leading-relaxed text-[#8d8d8d] md:text-[15px]">
              {paragraph}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-[#b0a99a] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#b0a99a] shadow-sm transition-colors duration-500 group-hover:bg-[#b0a99a] group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>

                  <h3 className="text-[11px] font-bold uppercase leading-snug tracking-[0.16em] text-[#171717]">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-5 text-[13px] leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-700">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
