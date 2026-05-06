import Link from "next/link";
import { BlogImage } from "@/components/blog/blog-image";
import { getDefaultBlogAuthorLabel, getDefaultBlogCta } from "@/features/blog/blog-context";
import { changeBlogPostStatusAction, updateBlogPostForAdminAction } from "@/features/blog/actions";
import { findBlogPostByIdForAdmin } from "@/server/repositories/blog.repository";

type AdminBlogEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; published?: string; unpublished?: string }>;
};

export default async function AdminBlogEditPage({ params, searchParams }: AdminBlogEditPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const post = await findBlogPostByIdForAdmin(id);
  const defaultCta = getDefaultBlogCta();

  if (!post) {
    return (
      <section className="max-w-3xl">
        <p className="section-title text-terracotta">Editorial</p>
        <h2 className="mt-2 font-serif text-4xl">Article introuvable</h2>
        <div className="mt-8 border border-line bg-surface p-6">
          <Link href="/admin/blog" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
            Retour blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl">
      <p className="section-title text-terracotta">Editorial</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl">{post.title}</h2>
          <p className="mt-2 text-sm text-muted">
            Statut {post.status}
            {post.publishedAt ? ` · Publié le ${post.publishedAt.toLocaleDateString("fr-FR")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog" className="border border-line px-4 py-2 text-sm font-bold">
            Retour articles
          </Link>
          {post.status === "published" ? (
            <Link href={`/blog/${post.slug}`} className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
              Voir public
            </Link>
          ) : null}
        </div>
      </div>

      {query?.saved ? <div className="mt-6 border border-line bg-surface p-4 text-sm">Article enregistre.</div> : null}
      {query?.published ? (
        <div className="mt-6 border border-line bg-surface p-4 text-sm">Article publie.</div>
      ) : null}
      {query?.unpublished ? (
        <div className="mt-6 border border-line bg-surface p-4 text-sm">Article repasse en brouillon.</div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {post.status === "published" ? (
          <form action={changeBlogPostStatusAction}>
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="action" value="unpublish" />
            <button type="submit" className="border border-line px-4 py-2 text-sm font-bold">
              Depublier
            </button>
          </form>
        ) : (
          <form action={changeBlogPostStatusAction}>
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="action" value="publish" />
            <button type="submit" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
              Publier
            </button>
          </form>
        )}
      </div>

      <form action={updateBlogPostForAdminAction} className="mt-8 grid gap-5 border border-line bg-surface p-6">
        <input type="hidden" name="id" value={post.id} />

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold">
            Titre
            <input name="title" required defaultValue={post.title} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
          <label className="text-sm font-bold">
            Slug
            <input name="slug" required defaultValue={post.slug} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
          <label className="text-sm font-bold">
            Categorie
            <input name="category" defaultValue={post.category ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
          <label className="text-sm font-bold">
            Image URL
            <input name="imageUrl" defaultValue={post.imageUrl ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
            <span className="mt-2 block text-xs font-normal text-muted">
              Utilisee comme fallback si aucune photo n&apos;est uploadee.
            </span>
          </label>
          <label className="text-sm font-bold">
            Alt image
            <input name="imageAlt" defaultValue={post.imageAlt ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-start">
          <label className="text-sm font-bold">
            Photo de l&apos;article
            <input
              type="file"
              name="imageFile"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
            <span className="mt-2 block text-xs font-normal text-muted">
              JPG, PNG ou WebP. Si aucun fichier n&apos;est choisi, l&apos;image URL ci-dessus reste utilisee.
            </span>
          </label>
          <div className="relative aspect-[1.45/0.9] overflow-hidden border border-line bg-background">
            <BlogImage src={post.imageUrl} alt={post.imageAlt ?? post.title} fill sizes="280px" className="object-cover" />
          </div>
        </div>

        <label className="text-sm font-bold">
          Extrait
          <textarea name="excerpt" rows={3} defaultValue={post.excerpt ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>

        <label className="text-sm font-bold">
          Contenu
          <textarea name="content" rows={14} required defaultValue={post.content} className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold">
            SEO title
            <input name="seoTitle" defaultValue={post.seoTitle ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
          <label className="text-sm font-bold">
            SEO description
            <textarea name="seoDescription" rows={3} defaultValue={post.seoDescription ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
          </label>
        </div>

        <label className="text-sm font-bold">
          Signature auteur
          <input
            name="authorLabel"
            defaultValue={post.authorLabel ?? getDefaultBlogAuthorLabel()}
            className="mt-2 w-full border border-line bg-background px-3 py-3"
          />
        </label>

        <label className="text-sm font-bold">
          Le regard d&apos;Art Home Déco
          <textarea
            name="brandPerspectiveMarkdown"
            rows={8}
            defaultValue={post.brandPerspectiveMarkdown ?? ""}
            className="mt-2 w-full border border-line bg-background px-3 py-3"
          />
        </label>

        <div className="grid gap-5 border border-line/60 bg-background/40 p-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            CTA titre
            <input
              name="ctaTitle"
              defaultValue={post.ctaTitle ?? defaultCta.title}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>
          <label className="text-sm font-bold">
            CTA texte
            <textarea
              name="ctaBody"
              rows={4}
              defaultValue={post.ctaBody ?? defaultCta.body}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>
          <label className="text-sm font-bold">
            CTA bouton principal
            <input
              name="ctaPrimaryLabel"
              defaultValue={post.ctaPrimaryLabel ?? defaultCta.primaryLabel}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>
          <label className="text-sm font-bold">
            Lien principal
            <input
              name="ctaPrimaryLink"
              defaultValue={post.ctaPrimaryLink ?? defaultCta.primaryLink}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
            <span className="mt-2 block text-xs font-normal text-muted">
              Coller un lien produit boutique (ex: `/boutique/mon-produit`). Si vide, fallback `/boutique`.
            </span>
          </label>
          <label className="text-sm font-bold">
            CTA bouton secondaire
            <input
              name="ctaSecondaryLabel"
              defaultValue={post.ctaSecondaryLabel ?? defaultCta.secondaryLabel}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>
          <label className="text-sm font-bold">
            Lien secondaire
            <input
              name="ctaSecondaryLink"
              defaultValue={post.ctaSecondaryLink ?? defaultCta.secondaryLink}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="reviewedByHuman" defaultChecked={post.reviewedByHuman} />
          <span>Relu par un humain</span>
        </label>

        <button type="submit" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Enregistrer
        </button>
      </form>
    </section>
  );
}
