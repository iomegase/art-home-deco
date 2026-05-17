import type { MetadataRoute } from "next";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts, listCategories } from "@/server/repositories/catalog.repository";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const baseUrl = getSiteUrl();
const deployDate = process.env.VERCEL_GIT_COMMIT_TIMESTAMP
  ? new Date(Number(process.env.VERCEL_GIT_COMMIT_TIMESTAMP) * 1000)
  : new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    listActiveProducts(),
    listCategories(),
    listPublishedBlogPosts(),
  ]);

  const staticEntries = [
    "",
    "/boutique",
    "/blog",
    "/contact",
    "/mentions-legales",
    "/cgv",
    "/cgu",
    "/cookies",
    "/donnees-personnelles",
    "/livraison-retours",
    "/politique-de-confidentialite",
    "/boutique-decoration-saint-gervais-les-bains",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: deployDate,
  }));

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/boutique/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/categorie/${category.slug}`,
    lastModified: category.updatedAt,
  }));

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries, ...postEntries];
}
