import Link from "next/link";
import { listAllBlogPosts } from "@/server/repositories/blog.repository";

export default async function AdminBlogPage() {
  const posts = await listAllBlogPosts();

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Editorial</p>
          <h2 className="mt-2 font-serif text-4xl">Articles blog</h2>
        </div>
        <Link href="/admin/blog/new" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
          Nouveau brouillon
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl">{post.title}</h3>
                <p className="mt-1 text-sm text-muted">{post.slug}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">{post.status}</p>
                <p className="mt-1 text-muted">{post.generatedWithAI ? "Brouillon IA" : "Edition manuelle"}</p>
              </div>
            </div>
          </article>
        ))}
        {posts.length === 0 ? <p className="text-sm text-muted">Aucun article en base.</p> : null}
      </div>
    </section>
  );
}
