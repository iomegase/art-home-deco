import { Prisma } from "@prisma/client";
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
export type HomeSpotlightCategory = Awaited<ReturnType<typeof listHomeSpotlightCategories>>[number];
export type CatalogProductPage = Awaited<ReturnType<typeof listActiveProductsPage>>;

function buildActiveProductWhere(params?: { categorySlug?: string; query?: string }): Prisma.ProductWhereInput {
  return {
    status: "active",
    ...(params?.query
      ? {
          title: {
            contains: params.query,
            mode: "insensitive",
          },
        }
      : {}),
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
  };
}

export async function listActiveProducts(params?: { categorySlug?: string }) {
  return db.product.findMany({
    where: buildActiveProductWhere(params),
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });
}

export async function countActiveProducts(params?: { categorySlug?: string; query?: string }) {
  return db.product.count({ where: buildActiveProductWhere(params) });
}

export async function listActiveProductsPage(params?: {
  categorySlug?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(Math.max(params?.pageSize ?? 12, 1), 32);
  const requestedPage = Math.max(params?.page ?? 1, 1);
  const where = buildActiveProductWhere({
    categorySlug: params?.categorySlug,
    query: params?.query,
  });

  const total = await db.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const products = await db.product.findMany({
    where,
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    products,
    total,
    page,
    pageSize,
    totalPages,
  };
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
    where: {
      products: {
        some: {
          product: {
            status: "active",
          },
        },
      },
    },
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

export async function listHomeSpotlightCategories() {
  return db.category.findMany({
    where: {
      products: {
        some: {
          product: {
            status: "active",
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
      products: {
        where: {
          product: {
            status: "active",
          },
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: "asc" as const },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          product: {
            createdAt: "desc" as const,
          },
        },
        take: 1,
      },
    },
    orderBy: [{ title: "asc" }],
  });
}

export async function findCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  });
}
