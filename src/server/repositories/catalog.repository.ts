import { db } from "@/server/db/client";

const productInclude = {
  images: {
    orderBy: { position: "asc" as const },
  },
  categories: {
    include: {
      category: true,
    },
  },
};

export type CatalogProduct = Awaited<ReturnType<typeof listActiveProducts>>[number];
export type CatalogCategory = Awaited<ReturnType<typeof listCategories>>[number];

export async function listActiveProducts(params?: { categorySlug?: string }) {
  return db.product.findMany({
    where: {
      status: "active",
      ...(params?.categorySlug
        ? {
            categories: {
              some: {
                category: {
                  slug: params.categorySlug,
                },
              },
            },
          }
        : {}),
    },
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });
}

export async function findActiveProductBySlug(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      status: "active",
    },
    include: productInclude,
  });
}

export async function listCategories() {
  return db.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });
}

export async function findCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  });
}
