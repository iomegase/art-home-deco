import { db } from "@/server/db/client";

export type PublicBlogPost = Awaited<ReturnType<typeof listPublishedBlogPosts>>[number];

export async function listAllBlogPosts() {
  return db.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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
