import Link from "next/link";
import Image from "next/image";

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
    alt: "Vases ceramiques sur une table claire",
  },
  {
    src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85",
    alt: "Tasse artisanale en gres",
  },
  {
    src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=700&q=85",
    alt: "Objet decoratif vert olive",
  },
  {
    src: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=700&q=85",
    alt: "Ceramique sur fond sombre",
  },
];

const posts = [
  {
    title: "Composer une table ",
    src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Matieres naturelles",
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "Choisir une piece",
    src: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=85",
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 md:grid-cols-[0.95fr_1fr] md:items-center md:px-8 md:pb-20 md:pt-12">
     

           <div className="overflow-hidden rounded-[42%_58%_48%_52%/48%_45%_55%_52%]">
          <Image
          src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=90"
            alt="Atelier lumineux avec objets de decoration"
            width={1000}
            height={820}
            className="aspect-[1.05/0.85] h-full w-full object-cover"
          />
        </div>

        <div className="max-w-2xl">
          {/* <p className="section-title text-terracotta">Nouvelle collection</p> */}
          <h1 className="mt-4 max-w-xl text-5xl leading-none text-foreground md:text-7xl">
            Inspiré des Alpes, pensé pour votre intérieur.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Bienvenue chez Art Home Deco. Des objets choisis avec soin, du style
            Alpin aux inspirations tendances.
          </p>
          <Link
            href="/boutique"
            className="mt-8 inline-flex rounded-full bg-terracotta px-7 py-3 text-sm font-bold text-white transition hover:bg-brand"
          >
            Explorez notre boutique
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="absolute left-0 right-0 top-1/2 -z-10 h-28 -translate-y-1/2 " />
        <div className="grid gap-5 md:grid-cols-3">
          <Link
            href="/boutique"
            className="min-h-56 rounded-br-[4.5rem] rounded-tl-[4.5rem] bg-terracotta p-8 text-brand-contrast md:p-12"
          >
            <span className="block font-serif text-4xl leading-tight md:text-5xl">
              Collection actuelle
            </span>
          </Link>

          <Link
            href="/contact"
            className="group relative min-h-[320px] flex flex-col justify-between rounded-br-[5rem] rounded-tl-[5rem] bg-[#ece7d8] p-8 transition-all hover:bg-[#e5dfce] md:p-12"
          >
            {/* Petit détail graphique discret (Cercle ou Arche) */}
            <div className="absolute right-10 top-10 h-20 w-20 rounded-full border border-black/5 transition-transform duration-500 group-hover:scale-150 group-hover:border-black/10" />

            <h3 className="font-serif text-4xl leading-tight md:text-5xl text-foreground">
              Conseil <br /> décoration
            </h3>

            <div className="space-y-4">
              <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground opacity-0 transition-all duration-500 group-hover:opacity-100">
                Optimisation d&apos;espace, choix des matières et harmonie des
                couleurs.
              </p>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform group-hover:rotate-[-45deg]">
                →
              </div>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative h-80 overflow-hidden rounded-br-[5rem] rounded-tl-[5rem] bg-accent"
          >
            {/* Image d'ambiance avec un overlay sombre pour le texte */}
            <Image
              src= "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85"
              alt="Journal"
              fill
              className="object-cover mix-blend-multiply opacity-60 "
            />

            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                  Inspirations
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-4xl leading-tight md:text-5xl text-white">
                  Journal <br /> maison
                </h3>
                <p className="text-sm text-white/70 opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  Histoires d&apos;objets et d&apos;intérieurs.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[0.9fr_1fr] md:items-center md:px-8">
       
        <div>
          <p className="text-accent">Notre approche</p>
          <h2 className="mt-4 max-w-lg text-4xl leading-tight md:text-6xl">
            Une decoration pensee comme une composition.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted">
            Chaque piece est selectionnee pour dialoguer avec la lumiere, les
            textures et les usages du quotidien. L&apos;objectif: une maison
            plus calme, plus personnelle, plus durable.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold text-brand-contrast transition hover:bg-brand"
          >
            Découvrez nos conseils
          </Link>
        </div>
         <div className="overflow-hidden rounded-[42%_58%_48%_52%/48%_45%_55%_52%]">
          <Image
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85"
            alt="Atelier lumineux avec objets de decoration"
            width={1000}
            height={820}
            className="aspect-[1.05/0.85] h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-4xl md:text-5xl">Gallerie</h2>
        </div>
        <div className="mt-6 flex gap-5 overflow-x-auto px-5 pb-2 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {gallery.map((item) => (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={700}
              height={450}
              className="aspect-square rounded-2xl max-w-sm shrink-0 object-cover w-50"
            />
          ))}
        </div>
      </section>

      {/* --- JOURNAL & NEWSLETTER --- */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 grid gap-20 lg:grid-cols-[1fr_0.4fr]">
        <div>
          <h2 className="font-serif text-5xl mb-12">Le Journal</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {posts.map((post, i) => (
              <article key={i} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl bg-surface">
                  <Image
                    src={post.src}
                    alt=""
                    width={600}
                    height={350}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-4 font-serif text-xl group-hover:text-terracotta transition-colors">
                  {post.title}
                </h3>
                <Link
                  href="/blog"
                  className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground"
                >
                  Lire l&apos;article
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* NEWSLETTER DESIGNED AS A CARD */}
        <aside className="sticky top-24 self-start rounded-[3rem] bg-terracotta p-10 text-white shadow-xl">
          <h2 className="font-serif text-3xl">Newsletter</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Rejoignez le cercle Art Home Deco pour recevoir nos inspirations
            saisonnières.
          </p>
          <form className="mt-10 space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm placeholder:text-white/60 focus:bg-white focus:text-black focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-white py-4 text-sm font-bold text-terracotta transition-transform hover:scale-[1.02] active:scale-95"
            >
              S&apos;inscrire
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
