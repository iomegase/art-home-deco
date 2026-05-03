import { db } from "@/server/db/client";
import type { ProductEditorInput } from "@/schemas/forms/product-editor.schema";
import type { ProductImportRowInput } from "@/schemas/forms/product-import.schema";
import { slugify } from "@/lib/slugify";

const adminProductInclude = {
  images: {
    orderBy: { position: "asc" as const },
  },
  categories: {
    include: {
      category: true,
    },
    orderBy: {
      category: {
        title: "asc" as const,
      },
    },
  },
};

async function ensureCategories(categorySlugs: string[]) {
  const entries = await Promise.all(
    categorySlugs.map(async (rawValue) => {
      const normalized = slugify(rawValue);
      if (!normalized) {
        return null;
      }

      const category = await db.category.upsert({
        where: { slug: normalized },
        update: {},
        create: {
          slug: normalized,
          title: rawValue
            .trim()
            .split(/[-\s]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
        },
      });

      return category;
    }),
  );

  return entries.filter((entry) => entry !== null);
}

async function syncProductCategories(productId: string, categorySlugs: string[]) {
  const categories = await ensureCategories(categorySlugs);

  await db.productCategory.deleteMany({
    where: { productId },
  });

  if (!categories.length) {
    return;
  }

  await db.productCategory.createMany({
    data: categories.map((category) => ({
      productId,
      categoryId: category.id,
    })),
  });
}

async function syncPrimaryImage(productId: string, imageUrl?: string, imageAlt?: string) {
  const normalizedUrl = imageUrl?.trim();
  const normalizedAlt = imageAlt?.trim();

  const firstImage = await db.productImage.findFirst({
    where: { productId },
    orderBy: { position: "asc" },
  });

  if (!normalizedUrl && !normalizedAlt) {
    return;
  }

  if (firstImage) {
    await db.productImage.update({
      where: { id: firstImage.id },
      data: {
        url: normalizedUrl || firstImage.url,
        alt: normalizedAlt || firstImage.alt,
        position: 0,
      },
    });
    return;
  }

  if (!normalizedUrl) {
    return;
  }

  await db.productImage.create({
    data: {
      productId,
      url: normalizedUrl,
      alt: normalizedAlt || undefined,
      position: 0,
    },
  });
}

export async function listAdminProducts() {
  return db.product.findMany({
    include: {
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}

export async function findProductForAdmin(id: string) {
  return db.product.findUnique({
    where: { id },
    include: adminProductInclude,
  });
}

export async function upsertImportedProduct(input: ProductImportRowInput) {
  const existingProduct =
    (await db.product.findUnique({ where: { sku: input.sku } })) ||
    (input.externalStockId
      ? await db.product.findFirst({ where: { externalStockId: input.externalStockId } })
      : null) ||
    (input.barcode ? await db.product.findFirst({ where: { barcode: input.barcode } }) : null) ||
    (input.slug ? await db.product.findUnique({ where: { slug: input.slug } }) : null);

  const payload = {
    title: input.title,
    slug: input.slug ?? slugify(input.title),
    sku: input.sku,
    barcode: input.barcode || null,
    externalStockId: input.externalStockId || null,
    externalProvider: input.externalStockId ? "shopcaisse" : null,
    stockSource: input.externalStockId ? "shopcaisse" : "local",
    shortDescription: input.shortDescription || null,
    description: input.description || null,
    priceCents: input.priceCents,
    stock: input.stock,
    status: input.status,
    shippingClass: input.shippingClass,
    estimatedWeightGrams: input.estimatedWeightGrams,
    isFragile: input.isFragile,
    pickupOnly: input.pickupOnly || input.shippingClass === "PICKUP_ONLY",
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  const product = existingProduct
    ? await db.product.update({
        where: { id: existingProduct.id },
        data: payload,
      })
    : await db.product.create({
        data: payload,
      });

  await syncProductCategories(product.id, input.categorySlugs);
  await syncPrimaryImage(product.id, input.imageUrl, input.imageAlt);

  return { product, updated: Boolean(existingProduct) };
}

export async function updateProductForAdmin(input: ProductEditorInput) {
  const product = await db.product.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      sku: input.sku,
      barcode: input.barcode || null,
      externalStockId: input.externalStockId || null,
      externalProvider: input.externalStockId ? "shopcaisse" : null,
      stockSource: input.externalStockId ? "shopcaisse" : "local",
      shortDescription: input.shortDescription || null,
      description: input.description || null,
      priceCents: input.priceCents,
      stock: input.stock,
      status: input.status,
      shippingClass: input.shippingClass,
      estimatedWeightGrams: input.estimatedWeightGrams,
      isFragile: input.isFragile,
      pickupOnly: input.pickupOnly || input.shippingClass === "PICKUP_ONLY",
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
    },
  });

  await syncProductCategories(product.id, input.categorySlugs);
  await syncPrimaryImage(product.id, input.imageUrl, input.imageAlt);

  return product;
}

export async function updateProductAiDraft(
  input: Pick<ProductEditorInput, "id"> & {
    shortDescription: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    imageAlt?: string;
  },
) {
  const product = await db.product.update({
    where: { id: input.id },
    data: {
      shortDescription: input.shortDescription,
      description: input.description,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      status: "draft",
    },
  });

  await syncPrimaryImage(product.id, undefined, input.imageAlt);

  return product;
}
