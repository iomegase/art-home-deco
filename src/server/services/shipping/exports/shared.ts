import type { ColishipExportOrder } from "@/server/repositories/order.repository";

export type ExportableColishipOrder = ColishipExportOrder;

export function hasCompleteShippingAddress(order: {
  shippingAddressLine1: string | null;
  shippingPostalCode: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
}) {
  return Boolean(
    order.shippingAddressLine1?.trim() &&
      order.shippingPostalCode?.trim() &&
      order.shippingCity?.trim() &&
      order.shippingCountry?.trim(),
  );
}

export function toCountryIsoCode(country: string | null) {
  const normalized = country?.trim().toLowerCase() ?? "";

  if (!normalized || normalized === "france") {
    return "FR";
  }

  const mapping: Record<string, string> = {
    france: "FR",
    belgique: "BE",
    belgium: "BE",
    suisse: "CH",
    switzerland: "CH",
    luxembourg: "LU",
    allemagne: "DE",
    germany: "DE",
    italie: "IT",
    italy: "IT",
    espagne: "ES",
    spain: "ES",
    portugal: "PT",
    "pays-bas": "NL",
    pays_bas: "NL",
    netherlands: "NL",
    autriche: "AT",
    austria: "AT",
  };

  return mapping[normalized.replace(/\s+/g, "_")] ?? country?.trim().slice(0, 2).toUpperCase() ?? "FR";
}

export function formatCurrencyCentsToEuros(cents: number) {
  return (cents / 100).toFixed(2);
}

export function formatWeightKgForColishipClassic(weightKg: string) {
  return weightKg.replace(".", ",");
}
