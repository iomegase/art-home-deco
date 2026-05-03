import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedBlogPostBySlug } from "@/server/repositories/blog.repository";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: post.imageUrl,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "Art Home Deco",
    },
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        {post.category ? <p className="section-title text-terracotta">{post.category}</p> : null}
        <h1 className="mt-3 font-serif text-5xl leading-none md:text-7xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{post.excerpt}</p> : null}
        {post.imageUrl ? (
          <div className="relative mt-10 aspect-[1.55/0.9] overflow-hidden bg-surface">
            <Image src={post.imageUrl} alt="" fill sizes="100vw" priority className="object-cover" />
          </div>
        ) : null}
        <div className="mt-10 space-y-6 text-base leading-8 text-foreground">
          {post.content.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
