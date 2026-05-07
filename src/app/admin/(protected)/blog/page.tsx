import Link from "next/link";
import { Eye, Pen, Trash2, Plus } from "lucide-react";
import { BlogImage } from "@/components/blog/blog-image";
import { deleteBlogPostForAdminAction } from "@/features/blog/actions";
import { listAllBlogPosts } from "@/server/repositories/blog.repository";

type AdminBlogPageProps = {
  searchParams?: Promise<{ page?: string; deleted?: string }>;
};

const PAGE_SIZE = 8;

function toPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const posts = await listAllBlogPosts();
  const page = toPage(query?.page);

  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedPosts = posts.slice(start, start + PAGE_SIZE);

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-title text-terracotta">Blog</p>
          <h2 className="mt-2 font-serif text-4xl">Suivi editorial</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Gere les brouillons et les publications avec la meme structure de pilotage que le suivi commandes.
          </p>
        </div>
        <Link href="/admin/blog/new" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau brouillon
          </span>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Articles totaux</p>
          <p className="mt-2 font-serif text-4xl">{posts.length}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Articles publies</p>
          <p className="mt-2 font-serif text-4xl">{publishedCount}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Brouillons</p>
          <p className="mt-2 font-serif text-4xl">{draftCount}</p>
        </article>
      </div>

      {query?.deleted ? (
        <div className="mt-6 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          L&apos;article a ete retire du catalogue.
        </div>
      ) : null}

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Publication</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map((post) => {
              const isPublished = post.status === "published";

              return (
                <tr key={post.id} className="border-t border-line">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-full border border-line bg-surface">
                        <BlogImage
                          src={post.imageUrl}
                          alt={post.title}
                          width={120}
                          height={120}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{post.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isPublished ? "Publie" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {post.publishedAt ? post.publishedAt.toLocaleDateString("fr-FR") : "Non publie"}
                  </td>
                  <td className="px-4 py-4 text-muted">{post.slug}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="flex h-10 w-10 items-center justify-center border border-line text-muted hover:bg-surface hover:text-foreground"
                        title="Modifier"
                        aria-label={`Modifier ${post.title}`}
                      >
                        <Pen className="h-4 w-4" />
                      </Link>

                      {isPublished ? (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="flex h-10 w-10 items-center justify-center border border-line text-muted hover:bg-surface hover:text-foreground"
                          title="Voir en ligne"
                          aria-label={`Voir ${post.title} en ligne`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center border border-line text-slate-300">
                          <Eye className="h-4 w-4" />
                        </div>
                      )}

                      <form action={deleteBlogPostForAdminAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <button
                          type="submit"
                          className="flex h-10 w-10 items-center justify-center border border-line text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                          title="Supprimer"
                          aria-label={`Supprimer ${post.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {posts.length > PAGE_SIZE ? (
        <div className="mt-8 flex justify-center gap-3">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/blog?page=${n}`}
              className={`flex h-10 w-10 items-center justify-center text-xs font-bold ${
                n === currentPage ? "bg-brand text-brand-contrast" : "border border-line text-muted hover:bg-surface"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
