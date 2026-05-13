import Link from "next/link";
import { Eye, Pen, Plus, Sparkles } from "lucide-react";
import { BlogImage } from "@/components/blog/blog-image";
import { listAllBlogPosts } from "@/server/repositories/blog.repository";
import { DeleteBlogPostButton } from "@/components/admin/blog/delete-blog-post-button";

type AdminBlogPageProps = {
  searchParams?: Promise<{ page?: string; deleted?: string }>;
};

const PAGE_SIZE = 8;

function toPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const posts = await listAllBlogPosts();
  const page = toPage(query?.page);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedPosts = posts.slice(start, start + PAGE_SIZE);

  const stats = [
    { label: "Totaux",   value: posts.length,    color: "#ec4899", bg: "#fdf2f8" },
    { label: "Publiés",  value: publishedCount,  color: "#22c55e", bg: "#f0fdf4" },
    { label: "Brouillons", value: draftCount,    color: "#f97316", bg: "#fff7ed" },
  ];

  return (
    <div className="grid gap-10">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Suivi éditorial
          </p>
          <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">
            Blog
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
            style={{ backgroundColor: "#fdf2f8", color: "#ec4899" }}
          >
            <Sparkles size={13} />
            Brouillon IA
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-[#111] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#333]"
          >
            <Plus size={13} />
            Nouvel article
          </Link>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-5"
          >
            <span
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{ backgroundColor: stat.color }}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Delete confirmation ── */}
      {query?.deleted ? (
        <div className="flex items-center gap-3 border-l-[3px] border-[#ef4444] bg-[#fef2f2] px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ef4444]">
            Article supprimé du catalogue.
          </span>
        </div>
      ) : null}

      {/* ── Table ── */}
      <div className="overflow-x-auto shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
              {["Article", "Statut", "Publication", "Slug", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map((post) => {
              const isPublished = post.status === "published";
              return (
                <tr
                  key={post.id}
                  className="group border-b border-[#f8f8f8] bg-white transition-colors hover:bg-[#fafafa]"
                >
                  {/* Article */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden bg-[#f6f5f3]">
                        <BlogImage
                          src={post.imageUrl}
                          alt={post.title}
                          width={88}
                          height={88}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="max-w-[260px] truncate text-[12px] font-bold text-[#111]">
                        {post.title}
                      </p>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: isPublished ? "#22c55e" : "#f97316" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isPublished ? "#22c55e" : "#f97316" }}
                      />
                      {isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {post.publishedAt
                        ? post.publishedAt.toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3.5">
                    <span className="max-w-[180px] truncate text-[10px] text-slate-400 font-mono">
                      {post.slug}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit */}
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        title="Modifier"
                        aria-label={`Modifier ${post.title}`}
                        className="flex h-8 w-8 items-center justify-center transition-all hover:brightness-95"
                        style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                      >
                        <Pen size={13} strokeWidth={2.5} />
                      </Link>

                      {/* View */}
                      {isPublished ? (
                        <Link
                          href={`/blog/${post.slug}`}
                          title="Voir en ligne"
                          aria-label={`Voir ${post.title}`}
                          className="flex h-8 w-8 items-center justify-center transition-all hover:brightness-95"
                          style={{ backgroundColor: "#f0fdf4", color: "#22c55e" }}
                        >
                          <Eye size={13} strokeWidth={2.5} />
                        </Link>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center bg-[#fafafa]">
                          <Eye size={13} strokeWidth={2} className="text-slate-300" />
                        </span>
                      )}

                      {/* Delete */}
                      <DeleteBlogPostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                    Aucun article pour le moment.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {posts.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/blog?page=${n}`}
              className="flex h-8 w-8 items-center justify-center text-[10px] font-bold uppercase tracking-[0.1em] transition-all"
              style={
                n === currentPage
                  ? { backgroundColor: "#ec4899", color: "#fff" }
                  : { backgroundColor: "#fafafa", color: "#aaa" }
              }
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
