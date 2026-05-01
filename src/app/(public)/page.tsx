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
    title: "Composer une table chaleureuse",
    src: "https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "Matieres naturelles et lignes douces",
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=85",
  },
  {
    title: "Choisir une piece signature",
    src: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=85",
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 md:grid-cols-[0.95fr_1fr] md:items-center md:px-8 md:pb-20 md:pt-12">
        <div className="overflow-hidden rounded-t-full bg-surface">
          <Image
            src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=90"
            alt="Collection de poteries artisanales sur une table en bois"
            width={1100}
            height={1120}
            className="aspect-[1/1.02] h-full w-full object-cover"
            priority
          />
        </div>

        <div className="max-w-2xl">
          <p className="section-title text-terracotta">Nouvelle collection</p>
          <h1 className="mt-4 max-w-xl text-5xl leading-none text-foreground md:text-7xl">
            Objets de maison pour interieurs sensibles.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Une selection de ceramiques, textiles et pieces decoratives choisies pour leur matiere,
            leur volume et leur presence dans la maison.
          </p>
          <Link
            href="/boutique"
            className="mt-8 inline-flex rounded-full bg-terracotta px-7 py-3 text-sm font-bold text-white transition hover:bg-brand"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="absolute left-0 right-0 top-1/2 -z-10 h-28 -translate-y-1/2 bg-surface" />
        <div className="grid gap-5 md:grid-cols-3">
          <Link href="/boutique" className="min-h-56 rounded-br-[4.5rem] rounded-tl-[4.5rem] bg-terracotta p-8 text-brand-contrast md:p-12">
            <span className="block font-serif text-4xl leading-tight md:text-5xl">Collection actuelle</span>
          </Link>
          <Link href="/contact" className="min-h-56 rounded-br-[4.5rem] rounded-tl-[4.5rem] bg-[#ece7d8] p-8 md:p-12">
            <span className="block font-serif text-4xl leading-tight md:text-5xl">Conseil decoration</span>
          </Link>
          <Link href="/blog" className="min-h-56 rounded-br-[4.5rem] rounded-tl-[4.5rem] bg-accent p-8 text-brand-contrast md:p-12">
            <span className="block font-serif text-4xl leading-tight md:text-5xl">Journal maison</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[0.9fr_1fr] md:items-center md:px-8">
        <div className="overflow-hidden rounded-[42%_58%_48%_52%/48%_45%_55%_52%]">
          <Image
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85"
            alt="Atelier lumineux avec objets de decoration"
            width={1000}
            height={820}
            className="aspect-[1.05/0.85] h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="section-title text-accent">Notre approche</p>
          <h2 className="mt-4 max-w-lg text-4xl leading-tight md:text-6xl">
            Une decoration pensee comme une composition.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted">
            Chaque piece est selectionnee pour dialoguer avec la lumiere, les textures et les usages
            du quotidien. L&apos;objectif: une maison plus calme, plus personnelle, plus durable.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold text-brand-contrast transition hover:bg-brand"
          >
            Learn more
          </Link>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-serif text-4xl md:text-5xl">Gallery</h2>
        </div>
        <div className="mt-6 flex gap-5 overflow-x-auto px-5 pb-2 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {gallery.map((item) => (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={700}
              height={450}
              className="aspect-[1.25/0.8] w-[72vw] max-w-sm shrink-0 object-cover md:w-80"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[1fr_0.72fr] md:items-end md:px-8">
        <div>
          <h2 className="font-serif text-4xl md:text-5xl">Blog</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {posts.map((post) => (
              <article key={post.title}>
                <Image
                  src={post.src}
                  alt=""
                  width={600}
                  height={350}
                  className="aspect-[1.4/0.82] w-full object-cover"
                />
                <h3 className="mt-3 font-sans text-sm font-bold leading-snug">{post.title}</h3>
                <Link href="/blog" className="mt-2 inline-flex text-xs font-bold text-muted hover:text-terracotta">
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-l-full rounded-tr-[6rem] bg-terracotta px-8 py-10 text-brand-contrast md:px-12 md:py-14">
          <h2 className="font-serif text-4xl md:text-5xl">Newsletter</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-brand-contrast/80">
            Recevez les nouvelles pieces, inspirations saisonnieres et conseils decoration.
          </p>
          <form className="mt-7 flex rounded-full bg-brand-contrast p-1">
            <input
              type="email"
              aria-label="Adresse email"
              placeholder="Votre email"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-brand outline-none placeholder:text-muted"
            />
            <button type="submit" className="grid h-11 w-11 place-items-center rounded-full bg-accent text-brand-contrast">
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
