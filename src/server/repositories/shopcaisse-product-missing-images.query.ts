import type { Prisma } from "@prisma/client";
import { slugify } from "@/lib/slugify";

export type ProductsMissingImagesFilters = {
  family?: string | null;
  status?: string | null;
  q?: string | null;
  withStockOnly?: boolean;
  shopcaisseOnly?: boolean;
};

export function buildProductsMissingImagesWhere(
  filters: ProductsMissingImagesFilters,
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [
    { images: { none: {} } },
    { status: { not: "archived" } },
  ];

  if (filters.family) {
    and.push({
      categories: {
        some: {
          category: {
            slug: slugify(filters.family),
          },
        },
      },
    });
  }

  if (filters.status) {
    and.push({ status: filters.status });
  }

  if (filters.withStockOnly) {
    and.push({ stock: { gt: 0 } });
  }

  if (filters.shopcaisseOnly) {
    and.push({ externalProvider: "shopcaisse" });
  }

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { barcode: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  return { AND: and };
}
