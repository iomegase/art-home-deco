import { resolveShippingCostCents } from "@/features/shipping/rates";
import { normalizeCartItems } from "@/features/cart/limits";
import type { CartQuote } from "@/features/cart/types";
import type { CartQuoteRequest } from "@/schemas/api/cart.schema";
import { db } from "@/server/db/client";

export async function recalculateCartUseCase(input: CartQuoteRequest): Promise<CartQuote> {
  const normalizedItems = normalizeCartItems(input.items);
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      status: "active",
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  const lines = normalizedItems.map((item) => {
    const product = productById.get(item.productId);

    if (!product) {
      throw new Error("Produit indisponible.");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuffisant pour ${product.title}.`);
    }

    return {
      productId: product.id,
      externalStockId: product.externalStockId ?? undefined,
      slug: product.slug,
      title: product.title,
      sku: product.sku,
      imageUrl: product.images[0]?.url,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * item.quantity,
      stock: product.stock,
      pickupOnly: product.pickupOnly,
      shippingClass: product.shippingClass,
    };
  });

  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const shippingCostCents = resolveShippingCostCents({
    shippingMethod: input.shippingMethod,
    items: lines.map((line) => ({
      shippingClass: line.shippingClass,
      pickupOnly: line.pickupOnly,
    })),
  });

  const quoteLines = lines.map((line) => ({
    productId: line.productId,
    externalStockId: line.externalStockId,
    slug: line.slug,
    title: line.title,
    sku: line.sku,
    imageUrl: line.imageUrl,
    quantity: line.quantity,
    unitPriceCents: line.unitPriceCents,
    lineTotalCents: line.lineTotalCents,
    stock: line.stock,
    shippingClass: line.shippingClass,
    pickupOnly: line.pickupOnly,
  }));

  return {
    lines: quoteLines,
    subtotalCents,
    shippingCostCents,
    totalCents: subtotalCents + shippingCostCents,
    currency: "eur",
    shippingMethod: input.shippingMethod,
  };
}
