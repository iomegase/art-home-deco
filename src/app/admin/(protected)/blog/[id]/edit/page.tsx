import Link from "next/link";
import { ArrowLeft, Eye, Globe, EyeOff } from "lucide-react";
import { BlogImage } from "@/components/blog/blog-image";
import { getDefaultBlogAuthorLabel, getDefaultBlogCta } from "@/features/blog/blog-context";
import { changeBlogPostStatusAction, updateBlogPostForAdminAction } from "@/features/blog/actions";
import { findBlogPostByIdForAdmin } from "@/server/repositories/blog.repository";

type AdminBlogEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; published?: string; unpublished?: string }>;
};

const inputClass =
  "mt-2 w-full border-0 border-b border-[#e8e8e8] bg-transparent px-0 py-2 text-[13px] text-[#111] outline-none transition placeholder:text-slate-300 focus:border-[#111]";

const textareaClass =
  "mt-2 w-full resize-y border border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 text-[13px] text-[#111] outline-none transition focus:border-[#bbb] focus:bg-white";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">
      {children}
    </span>
  );
}

function SectionTitle({ children, n }: { children: React.ReactNode; n: number }) {
  return (
    <div className="flex items-center gap-3 border-t border-[#f0f0f0] pt-8">
      <span
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-[9px] font-bold"
        style={{ backgroundColor: "#fdf2f8", color: "#ec4899" }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111]">
        {children}
      </p>
      <span className="flex-1 border-t border-[#f0f0f0]" />
    </div>
  );
}

export default async function AdminBlogEditPage({ params, searchParams }: AdminBlogEditPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const post = await findBlogPostByIdForAdmin(id);
  const defaultCta = getDefaultBlogCta();

  if (!post) {
    return (
      <div className="grid gap-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Éditorial</p>
          <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">
            Article introuvable
          </h1>
        </div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 bg-[#111] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#333]"
        >
          <ArrowLeft size={13} />
          Retour au blog
        </Link>
      </div>
    );
  }

  const isPublished = post.status === "published";

  return (
    <div className="grid gap-10 max-w-4xl">

      {/* ── Header ── */}
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-[#111]"
        >
          <ArrowLeft size={11} />
          Blog
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Éditorial — édition
            </p>
            <h1 className="mt-2 max-w-[560px] text-[28px] font-[200] leading-tight tracking-[-0.03em] text-[#111]">
              {post.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
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
              {post.publishedAt && (
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  · {post.publishedAt.toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
                style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
              >
                <Eye size={13} />
                Voir public
              </Link>
            )}

            {isPublished ? (
              <form action={changeBlogPostStatusAction}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="action" value="unpublish" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
                  style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                >
                  <EyeOff size={13} />
                  Dépublier
                </button>
              </form>
            ) : (
              <form action={changeBlogPostStatusAction}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="action" value="publish" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
                  style={{ backgroundColor: "#f0fdf4", color: "#22c55e" }}
                >
                  <Globe size={13} />
                  Publier
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Flash messages ── */}
      {query?.saved && (
        <div className="flex items-center gap-3 border-l-[3px] border-[#22c55e] bg-[#f0fdf4] px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#22c55e]">
            Article enregistré avec succès.
          </span>
        </div>
      )}
      {query?.published && (
        <div className="flex items-center gap-3 border-l-[3px] border-[#3b82f6] bg-[#eff6ff] px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3b82f6]">
            Article publié — visible sur le site.
          </span>
        </div>
      )}
      {query?.unpublished && (
        <div className="flex items-center gap-3 border-l-[3px] border-[#f97316] bg-[#fff7ed] px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f97316]">
            Article repassé en brouillon.
          </span>
        </div>
      )}

      {/* ── Main form ── */}
      <form action={updateBlogPostForAdminAction} className="grid gap-8">
        <input type="hidden" name="id" value={post.id} />

        {/* — Identité — */}
        <SectionTitle n={1}>Identité</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="grid">
            <FieldLabel>Titre *</FieldLabel>
            <input name="title" required defaultValue={post.title} className={inputClass} />
          </label>
          <label className="grid">
            <FieldLabel>Slug *</FieldLabel>
            <input name="slug" required defaultValue={post.slug} className={inputClass} />
          </label>
          <label className="grid">
            <FieldLabel>Catégorie</FieldLabel>
            <input name="category" defaultValue={post.category ?? ""} className={inputClass} />
          </label>
          <label className="grid">
            <FieldLabel>Signature auteur</FieldLabel>
            <input
              name="authorLabel"
              defaultValue={post.authorLabel ?? getDefaultBlogAuthorLabel()}
              className={inputClass}
            />
          </label>
        </div>

        {/* — Image — */}
        <SectionTitle n={2}>Image</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-[1fr_200px]">
          <div className="grid gap-6">
            <label className="grid">
              <FieldLabel>Image URL (fallback)</FieldLabel>
              <input name="imageUrl" defaultValue={post.imageUrl ?? ""} className={inputClass} placeholder="https://..." />
              <span className="mt-2 text-[10px] text-slate-400">
                Utilisée si aucun fichier n&apos;est uploadé.
              </span>
            </label>
            <label className="grid">
              <FieldLabel>Alt image</FieldLabel>
              <input name="imageAlt" defaultValue={post.imageAlt ?? ""} className={inputClass} />
            </label>
            <label className="grid">
              <FieldLabel>Upload photo (JPG / PNG / WebP)</FieldLabel>
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-[11px] text-slate-500 file:mr-4 file:border-0 file:bg-[#111] file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.14em] file:text-white"
              />
            </label>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden border border-[#f0f0f0] bg-[#f6f5f3]">
            <BlogImage
              src={post.imageUrl}
              alt={post.imageAlt ?? post.title}
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        </div>

        {/* — Contenu — */}
        <SectionTitle n={3}>Contenu</SectionTitle>
        <div className="grid gap-6">
          <label className="grid">
            <FieldLabel>Extrait</FieldLabel>
            <textarea name="excerpt" rows={3} defaultValue={post.excerpt ?? ""} className={textareaClass} />
          </label>
          <label className="grid">
            <FieldLabel>Corps de l&apos;article (Markdown) *</FieldLabel>
            <textarea name="content" rows={16} required defaultValue={post.content} className={textareaClass} />
          </label>
          <label className="grid">
            <FieldLabel>L&apos;œil de la maison (Markdown)</FieldLabel>
            <textarea
              name="brandPerspectiveMarkdown"
              rows={8}
              defaultValue={post.brandPerspectiveMarkdown ?? ""}
              className={textareaClass}
            />
          </label>
        </div>

        {/* — SEO — */}
        <SectionTitle n={4}>SEO</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="grid">
            <FieldLabel>Titre SEO</FieldLabel>
            <input name="seoTitle" defaultValue={post.seoTitle ?? ""} className={inputClass} />
          </label>
          <label className="grid">
            <FieldLabel>Description SEO</FieldLabel>
            <textarea name="seoDescription" rows={3} defaultValue={post.seoDescription ?? ""} className={textareaClass} />
          </label>
        </div>

        {/* — CTA — */}
        <SectionTitle n={5}>Call to action</SectionTitle>
        <div className="border-l-[3px] border-[#ec4899] pl-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="grid">
              <FieldLabel>Titre CTA</FieldLabel>
              <input name="ctaTitle" defaultValue={post.ctaTitle ?? defaultCta.title} className={inputClass} />
            </label>
            <label className="grid">
              <FieldLabel>Texte CTA</FieldLabel>
              <textarea name="ctaBody" rows={3} defaultValue={post.ctaBody ?? defaultCta.body} className={textareaClass} />
            </label>
            <label className="grid">
              <FieldLabel>Label bouton principal</FieldLabel>
              <input name="ctaPrimaryLabel" defaultValue={post.ctaPrimaryLabel ?? defaultCta.primaryLabel} className={inputClass} />
            </label>
            <label className="grid">
              <FieldLabel>Lien principal</FieldLabel>
              <input name="ctaPrimaryLink" defaultValue={post.ctaPrimaryLink ?? defaultCta.primaryLink} className={inputClass} placeholder="/boutique/mon-produit" />
              <span className="mt-2 text-[10px] text-slate-400">
                Vide = fallback vers <code className="font-mono">/boutique</code>
              </span>
            </label>
            <label className="grid">
              <FieldLabel>Label bouton secondaire</FieldLabel>
              <input name="ctaSecondaryLabel" defaultValue={post.ctaSecondaryLabel ?? defaultCta.secondaryLabel} className={inputClass} />
            </label>
            <label className="grid">
              <FieldLabel>Lien secondaire</FieldLabel>
              <input name="ctaSecondaryLink" defaultValue={post.ctaSecondaryLink ?? defaultCta.secondaryLink} className={inputClass} />
            </label>
          </div>
        </div>

        {/* — Validation — */}
        <SectionTitle n={6}>Validation</SectionTitle>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="reviewedByHuman"
            defaultChecked={post.reviewedByHuman}
            className="h-4 w-4 accent-[#111]"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Relu et validé par Art Home Déco
          </span>
        </label>

        {/* — Submit — */}
        <div className="flex items-center gap-3 border-t border-[#f0f0f0] pt-8">
          <button
            type="submit"
            className="bg-[#111] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#333]"
          >
            Enregistrer les modifications
          </button>
          <Link
            href="/admin/blog"
            className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 transition hover:text-[#111]"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
