import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";

export const metadata: Metadata = {
  title: "Journal decoration",
  description: "Guides d'achat, conseils deco, idees cadeaux et inspirations maison Art Home Deco.",
};

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <header className="border-b border-line pb-10">
        <p className="section-title text-terracotta">Journal deco</p>
        <h1 className="mt-3 max-w-3xl text-5xl leading-none md:text-7xl">Inspiration maison</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          Guides d&apos;achat, conseils decoration, idees cadeaux et tendances pour composer une maison plus
          personnelle.
        </p>
      </header>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="grid gap-4">
            {post.imageUrl ? (
              <Link href={`/blog/${post.slug}`} className="relative block aspect-[1.45/0.9] overflow-hidden bg-surface">
                <Image src={post.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </Link>
            ) : null}
            <div>
              {post.category ? <p className="section-title text-terracotta">{post.category}</p> : null}
              <h2 className="mt-2 font-serif text-4xl leading-tight">
                <Link href={`/blog/${post.slug}`} className="hover:text-terracotta">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt ? <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p> : null}
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-bold hover:text-terracotta">
                Lire l&apos;article
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
