import type { ShippingClass } from "@/types/domain/product";

export const shippingClassOptions: Array<{ value: ShippingClass; label: string }> = [
  { value: "XS", label: "XS — ≤ 250 g" },
  { value: "S", label: "S — ≤ 500 g" },
  { value: "M", label: "M — ≤ 750 g" },
  { value: "L", label: "L — ≤ 1 kg" },
  { value: "XL", label: "XL — ≤ 2 kg" },
  { value: "PICKUP_ONLY", label: "Retrait boutique uniquement" },
];

export function getShippingClassAdminLabel(value: ShippingClass) {
  return shippingClassOptions.find((option) => option.value === value)?.label ?? value;
}
