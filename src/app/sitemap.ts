import type { MetadataRoute } from "next";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts, listCategories } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    listActiveProducts(),
    listCategories(),
    listPublishedBlogPosts(),
  ]);

  return [
    "",
    "/boutique",
    "/blog",
    "/contact",
    "/panier",
    "/mentions-legales",
    "/cgv",
    "/livraison-retours",
    "/politique-confidentialite",
    ...products.map((product) => `/boutique/${product.slug}`),
    ...categories.map((category) => `/categorie/${category.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
