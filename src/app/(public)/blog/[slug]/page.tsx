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

  if (!post) {
    return {};
  }

  return buildBlogMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = buildBlogArticleJsonLd(post);
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd(post);
  const imageAlt = buildBlogImageAlt(post);
  const authorLabel = post.authorLabel ?? getDefaultBlogAuthorLabel();
  const defaultCta = getDefaultBlogCta();
  
  const hasCustomBoutiqueLink = Boolean(post.ctaPrimaryLink?.trim());
  const ctaPrimaryLink = hasCustomBoutiqueLink ? post.ctaPrimaryLink!.trim() : "/boutique";
  const ctaPrimaryLabel = hasCustomBoutiqueLink
    ? (post.ctaPrimaryLabel?.trim() || "Voir ce produit")
    : "Explorez notre boutique";
    
  const cta = {
    title: post.ctaTitle ?? defaultCta.title,
    body: post.ctaBody ?? defaultCta.body,
    primaryLabel: ctaPrimaryLabel,
    primaryLink: ctaPrimaryLink,
    secondaryLabel: post.ctaSecondaryLabel ?? defaultCta.secondaryLabel,
    secondaryLink: post.ctaSecondaryLink ?? defaultCta.secondaryLink,
  };

  return (
    <main className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }} />
      
      <article className="max-w-7xl mx-auto px-8 pt-12 md:pt-24 pb-32">
        
        {/* HEADER DE L'ARTICLE */}
        <header className="flex flex-col max-w-7xl ">
          {post.category && (
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-1.5 bg-terracotta rotate-45"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-terracotta">
                {post.category}
              </p>
            </div>
          )}
          
          <h1 className="text-5xl text-slate-600 max-w-3xl leading-12">
            {post.title}
          </h1>

        

         
        </header>

        {/* IMAGE HERO - Format cinéma */}
        <div className="relative mt-20 md:mt-32 aspect-[21/9] w-full overflow-hidden bg-slate-50 rounded-md">
          <BlogImage 
            src={post.imageUrl} 
            alt={imageAlt} 
            fill 
            sizes="100vw" 
            priority 
            className="object-cover grayscale-[0.1]" 
          />
        </div>
         {/* EXCERPT CENTRÉ */}
          {post.excerpt && (
            <div className="mt-16 max-w-3xl mx-auto">
              <p className="text-center text-xl font-light leading-relaxed text-slate-400 italic font-serif">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>
          )}

        {/* CORPS DE L'ARTICLE */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 ">
          
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="prose prose-slate prose-md max-w-none 
              prose-headings:font-serif prose-headings:tracking-tight 
              prose-p:leading-relaxed prose-p:text-slate-600
              prose-a:text-terracotta prose-a:no-underline hover:prose-a:underline">
              <BlogMarkdown content={post.content} />
            </div>

            

            {/* Brand Perspective */}
            {post.brandPerspectiveMarkdown && (
              <section className="mt-24 p-12 md:p-20 bg-[#fcfcfc] border border-slate-50 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-terracotta"></div>
                <div className="italic text-slate-700 leading-loose font-serif text-xl text-center">
                  <BlogMarkdown content={post.brandPerspectiveMarkdown} />
                </div>
                <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-terracotta">
                  L&apos;œil de la maison
                </p>
              </section>
            )}

           
              {/* Infos Auteur / Date centrées */}
          <div className="mt-12 flex items-center justify-center gap-8 border-y border-slate-50 py-6 w-full max-w-lg mx-auto">
            <div className="text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Auteur</span>
              <p className="text-xs font-medium text-slate-900">{authorLabel}</p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            {post.publishedAt && (
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Date</span>
                <p className="text-xs font-medium text-slate-900">
                  {post.publishedAt.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
           
          </div>
        </div>

      </article>
       {/* CTA SECTION */}
       <section className="p-12 md:p-24 bg-slate-900 text-white rounded-sm text-center relative overflow-hidden max-w-7xl mx-auto">
              <h2 className="relative z-10 font-serif text-4xl md:text-6xl tracking-tight mb-8 italic">
                {cta.title}
              </h2>
              <p className="relative z-10 text-white/60 max-w-xl mx-auto leading-relaxed mb-12 font-light">
                {cta.body}
              </p>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href={cta.primaryLink} 
                  className="px-12 py-5 bg-white text-slate-900 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-terracotta hover:text-white"
                >
                  {cta.primaryLabel}
                </Link>
                <Link 
                  href={cta.secondaryLink} 
                  className="px-12 py-5 border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5"
                >
                  {cta.secondaryLabel}
                </Link>
              </div>
              <div className="absolute -bottom-12 -right-12 text-[15rem] font-serif italic text-white/5 select-none pointer-events-none">
                Art
              </div>
            </section>

            

      <footer className="py-24 flex flex-col items-center gap-8 border-t border-slate-50 ">
        <div className="w-px h-20 bg-slate-200"></div>
        <Link href="/blog" className="group flex items-center gap-4">
           <span className="text-[10px] tracking-[0.5em] text-slate-400 uppercase group-hover:text-terracotta transition-colors">
            Retour au journal
           </span>
        </Link>
      </footer>
    </main>
  );
}