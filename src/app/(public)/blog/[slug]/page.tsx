import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogImage } from "@/components/blog/blog-image";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { getDefaultBlogAuthorLabel, getDefaultBlogCta } from "@/features/blog/blog-context";
import {
  buildBlogArticleJsonLd,
  buildBlogBreadcrumbJsonLd,
  buildBlogImageAlt,
  buildBlogMetadata,
  stringifyJsonLd,
} from "@/features/blog/seo";
import { findPublishedBlogPostBySlug } from "@/server/repositories/blog.repository";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);
  if (!post) return {};
  return buildBlogMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  const jsonLd = buildBlogArticleJsonLd(post);
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd(post);
  const imageAlt = buildBlogImageAlt(post);
  const authorLabel = post.authorLabel ?? getDefaultBlogAuthorLabel();
  const defaultCta = getDefaultBlogCta();

  const hasCustomPrimaryLink = Boolean(post.ctaPrimaryLink?.trim());
  const cta = {
    title: post.ctaTitle ?? defaultCta.title,
    body: post.ctaBody ?? defaultCta.body,
    primaryLabel: hasCustomPrimaryLink
      ? (post.ctaPrimaryLabel?.trim() || "Voir ce produit")
      : "Explorer la boutique",
    primaryLink: hasCustomPrimaryLink ? post.ctaPrimaryLink!.trim() : "/boutique",
    secondaryLabel: post.ctaSecondaryLabel ?? defaultCta.secondaryLabel,
    secondaryLink: post.ctaSecondaryLink ?? defaultCta.secondaryLink,
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />

      {/* ── Header ── */}
      <div className="mx-auto max-w-[1240px] px-6 pb-12 pt-10 md:px-16 lg:px-0">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717]"
          >
            ← Journal
          </Link>
          {post.category && (
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
              {post.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-10 max-w-[860px] font-thin! text-[48px] leading-[0.94] tracking-[-0.04em] text-[#171717] md:text-[72px]">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-8 flex items-center gap-6 border-t border-[#e5e7eb] pt-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
            {authorLabel}
          </span>
          {post.publishedAt && (
            <>
              <span className="h-px w-6 bg-[#e5e7eb]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
                {post.publishedAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Hero image ── */}
      <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#f6f5f3]">
          <BlogImage
            src={post.imageUrl}
            alt={imageAlt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* ── Excerpt ── */}
      {post.excerpt && (
        <div className="mx-auto mt-16 max-w-[680px] px-6 md:px-0">
          <p className="text-center text-[18px] font-[300] italic leading-relaxed tracking-[-0.01em] text-[#b0a99a]">
            &ldquo;{post.excerpt}&rdquo;
          </p>
        </div>
      )}

      {/* ── Corps de l'article ── */}
      <div className="mx-auto mt-16 max-w-[680px] px-6 pb-16 md:px-0">
        <BlogMarkdown content={post.content} />

        {/* Brand perspective */}
        {post.brandPerspectiveMarkdown && (
          <section className="mt-16 bg-[#f6f5f3] px-10 py-12 md:px-16 md:py-16">
            <div className="text-center text-[16px] font-[300] italic leading-loose text-[#171717]">
              <BlogMarkdown content={post.brandPerspectiveMarkdown} />
            </div>
            <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
              L&apos;œil de la maison
            </p>
          </section>
        )}

        {/* Author / Date footer */}
        <div className="mt-16 flex items-center justify-center gap-8 border-t border-[#e5e7eb] pt-8">
          <div className="text-center">
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#b0a99a]">
              Auteur
            </span>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#171717]">
              {authorLabel}
            </p>
          </div>
          {post.publishedAt && (
            <>
              <span className="h-8 w-px bg-[#e5e7eb]" />
              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#b0a99a]">
                  Publié le
                </span>
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#171717]">
                  {post.publishedAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CTA strip ── */}
      <section className="border-t border-[#e5e7eb] py-24">
        <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Boutique
              </p>
              <h2 className="max-w-[560px] text-[40px] font-[300] leading-[0.94] tracking-[-0.03em] text-[#171717] md:text-[52px]">
                {cta.title}
              </h2>
              {cta.body && (
                <p className="mt-5 max-w-md text-[12px] font-bold uppercase leading-6 tracking-[0.1em] text-slate-500">
                  {cta.body}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3">
              <Link
                href={cta.primaryLink}
                className="inline-flex h-[48px] items-center justify-center bg-[#171717] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#747b4f]"
              >
                {cta.primaryLabel}
              </Link>
              <Link
                href={cta.secondaryLink}
                className="inline-flex h-[48px] items-center justify-center border border-[#dedede] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:border-[#171717]"
              >
                {cta.secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="border-t border-[#e5e7eb] py-12 text-center">
        <Link
          href="/blog"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a] transition hover:text-[#171717]"
        >
          ← Retour au journal
        </Link>
      </div>
    </main>
  );
}
