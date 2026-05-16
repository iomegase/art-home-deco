import type { MetadataRoute } from "next";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts, listCategories } from "@/server/repositories/catalog.repository";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const baseUrl = getSiteUrl();

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
    "/mentions-legales",
    "/cgv",
    "/cgu",
    "/cookies",
    "/donnees-personnelles",
    "/livraison-retours",
    "/politique-de-confidentialite",
    "/boutique-decoration-saint-gervais-les-bains",
    ...products.map((product) => `/boutique/${product.slug}`),
    ...categories.map((category) => `/categorie/${category.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
