import groq from "groq";
import { sanityClient, ensureSanityConfig } from "@/lib/sanity/client";
import type { BlogPost, Product, ProductCategory } from "@/types/sanity";

const productProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  sku,
  shortDescription,
  description,
  price,
  compareAtPrice,
  stockStatus,
  stockQuantity,
  images,
  "category": category->{
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    seoTitle,
    seoDescription,
    order,
    isFeatured
  },
  material,
  dimensions,
  color,
  style,
  room,
  careInstructions,
  tags,
  isFeatured,
  stripePriceId,
  seoTitle,
  seoDescription,
  imageAltBase,
  aiStatus
}`;

export async function getAllProducts(): Promise<Product[]> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "product"] | order(_createdAt desc) ${productProjection}`,
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "product" && slug.current == $slug][0] ${productProjection}`,
    { slug },
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "product" && isFeatured == true] | order(_createdAt desc) ${productProjection}`,
  );
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "product" && category->slug.current == $categorySlug] | order(_createdAt desc) ${productProjection}`,
    { categorySlug },
  );
}

export async function getAllCategories(): Promise<ProductCategory[]> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "productCategory"] | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      seoTitle,
      seoDescription,
      order,
      isFeatured
    }`,
  );
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      content,
      image,
      category,
      "relatedProducts": relatedProducts[]->{
        _id,
        title,
        "slug": slug.current
      },
      "relatedCategories": relatedCategories[]->{
        _id,
        title,
        "slug": slug.current
      },
      seoTitle,
      seoDescription,
      generatedWithAI,
      reviewedByHuman,
      publishedAt
    }`,
  );
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  ensureSanityConfig();
  return sanityClient.fetch(
    groq`*[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      content,
      image,
      category,
      "relatedProducts": relatedProducts[]->{
        _id,
        title,
        "slug": slug.current
      },
      "relatedCategories": relatedCategories[]->{
        _id,
        title,
        "slug": slug.current
      },
      seoTitle,
      seoDescription,
      generatedWithAI,
      reviewedByHuman,
      publishedAt
    }`,
    { slug },
  );
}
