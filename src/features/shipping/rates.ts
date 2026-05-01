import type { ShippingMethod } from "@/types/domain";

const colissimoRatesCents: Record<string, number> = {
  XS: 490,
  S: 690,
  M: 890,
  L: 1290,
  XL: 1890,
};

const shippingRank: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  PICKUP_ONLY: 99,
};

export function resolveShippingCostCents(input: {
  shippingMethod: ShippingMethod;
  items: Array<{ shippingClass: string; pickupOnly: boolean }>;
}): number {
  if (input.shippingMethod === "pickup") {
    return 0;
  }

  if (input.items.some((item) => item.pickupOnly || item.shippingClass === "PICKUP_ONLY")) {
    throw new Error("Un produit du panier est disponible uniquement en retrait boutique.");
  }

  const largestClass = input.items.reduce(
    (current, item) => (shippingRank[item.shippingClass] > shippingRank[current] ? item.shippingClass : current),
    "XS",
  );

  return colissimoRatesCents[largestClass] ?? colissimoRatesCents.XL;
}
