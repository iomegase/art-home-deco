import type { BlogPostDeleteInput, BlogPostEditorInput, BlogPostStatusInput } from "@/schemas/forms/blog-editor.schema";
import { db } from "@/server/db/client";

export type PublicBlogPost = Awaited<ReturnType<typeof listPublishedBlogPosts>>[number];

export async function listAllBlogPosts() {
  return db.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function findBlogPostByIdForAdmin(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

export async function findBlogPostBySlugForAdmin(slug: string) {
  return db.blogPost.findUnique({ where: { slug } });
}

export async function updateBlogPostForAdmin(input: BlogPostEditorInput) {
  return db.blogPost.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      authorLabel: input.authorLabel,
      brandPerspectiveMarkdown: input.brandPerspectiveMarkdown,
      ctaTitle: input.ctaTitle,
      ctaBody: input.ctaBody,
      ctaPrimaryLabel: input.ctaPrimaryLabel,
      ctaPrimaryLink: input.ctaPrimaryLink,
      ctaSecondaryLabel: input.ctaSecondaryLabel,
      ctaSecondaryLink: input.ctaSecondaryLink,
      reviewedByHuman: input.reviewedByHuman,
    },
  });
}

export async function setBlogPostStatusForAdmin(input: BlogPostStatusInput) {
  return db.blogPost.update({
    where: { id: input.id },
    data:
      input.action === "publish"
        ? {
            status: "published",
            reviewedByHuman: true,
            publishedAt: new Date(),
          }
        : {
            status: "draft",
            publishedAt: null,
          },
  });
}

export async function deleteBlogPostForAdmin(input: BlogPostDeleteInput) {
  return db.blogPost.delete({
    where: { id: input.id },
  });
}

export async function listPublishedBlogPosts() {
  return db.blogPost.findMany({
    where: {
      status: "published",
      publishedAt: {
        not: null,
      },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function findPublishedBlogPostBySlug(slug: string) {
  return db.blogPost.findFirst({
    where: {
      slug,
      status: "published",
      publishedAt: {
        not: null,
      },
    },
  });
}

export async function findLatestPublishedBlogPost() {
  return db.blogPost.findFirst({
    where: {
      status: "published",
      publishedAt: {
        not: null,
      },
    },
    orderBy: { publishedAt: "desc" },
  });
}
