import type { Product } from "@/types/domain";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  searchActiveProducts(params?: { categorySlug?: string; query?: string }): Promise<Product[]>;
}
