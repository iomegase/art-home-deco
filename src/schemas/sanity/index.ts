import type { SchemaTypeDefinition } from "sanity";
import { blogPostSchema } from "@/schemas/sanity/blog-post";
import { productSchema } from "@/schemas/sanity/product";
import { productCategorySchema } from "@/schemas/sanity/product-category";

export const schemaTypes: SchemaTypeDefinition[] = [
  productCategorySchema,
  productSchema,
  blogPostSchema,
];
