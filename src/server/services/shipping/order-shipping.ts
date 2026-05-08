import {
  calculateChargeableWeightKg,
  calculateVolumetricWeightKg,
  getPackagePresetForShippingClass,
} from "@/features/shipping/package-presets";
import type { ColishipExportOrder } from "@/server/repositories/order.repository";

export const DEFAULT_ORDER_ITEM_WEIGHT_GRAMS = 100;

const shippingClassRank: Record<string, number> = {
  PICKUP_ONLY: 0,
  XS: 1,
  TUBE_POSTER: 2,
  S: 3,
  SMALL_FRAGILE_BOX: 4,
  M: 5,
  L: 6,
  XL: 7,
};

export type OrderShippingEstimate = {
  totalWeightGrams: number;
  totalWeightKg: string;
  dominantShippingClass: string;
  packageDimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  volumetricWeightKg: string;
  chargeableWeightKg: string;
  usedFallbackWeight: boolean;
  hasPickupOnlyItem: boolean;
};

type OrderWithWeightedItems = Pick<ColishipExportOrder, "items">;

export function calculateOrderShippingEstimate(order: OrderWithWeightedItems): OrderShippingEstimate {
  let totalWeightGrams = 0;
  let dominantShippingClass = "XS";
  let usedFallbackWeight = false;
  let hasPickupOnlyItem = false;

  for (const item of order.items) {
    const product = item.product;
    const weightPerUnit = product?.estimatedWeightGrams && product.estimatedWeightGrams > 0
      ? product.estimatedWeightGrams
      : DEFAULT_ORDER_ITEM_WEIGHT_GRAMS;

    if (!product?.estimatedWeightGrams || product.estimatedWeightGrams <= 0) {
      usedFallbackWeight = true;
    }

    totalWeightGrams += weightPerUnit * item.quantity;

    if (product?.pickupOnly || product?.shippingClass === "PICKUP_ONLY") {
      hasPickupOnlyItem = true;
    }

    const productShippingClass = product?.shippingClass ?? "M";
    if ((shippingClassRank[productShippingClass] ?? shippingClassRank.M) > (shippingClassRank[dominantShippingClass] ?? shippingClassRank.XS)) {
      dominantShippingClass = productShippingClass;
    }
  }

  const packagePreset = getPackagePresetForShippingClass(dominantShippingClass);
  const packageDimensions = {
    lengthCm: packagePreset.lengthCm,
    widthCm: packagePreset.widthCm,
    heightCm: packagePreset.heightCm,
  };
  const realWeightKg = Number((totalWeightGrams / 1000).toFixed(3));
  const volumetricWeightKg = calculateVolumetricWeightKg(
    packageDimensions.lengthCm,
    packageDimensions.widthCm,
    packageDimensions.heightCm,
  );
  const chargeableWeightKg = calculateChargeableWeightKg(realWeightKg, volumetricWeightKg);

  return {
    totalWeightGrams,
    totalWeightKg: realWeightKg.toFixed(3),
    dominantShippingClass,
    packageDimensions,
    volumetricWeightKg: volumetricWeightKg.toFixed(3),
    chargeableWeightKg: chargeableWeightKg.toFixed(3),
    usedFallbackWeight,
    hasPickupOnlyItem,
  };
}
