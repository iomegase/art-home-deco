import { ShopcaisseResponseError } from "./errors";

export type ShopcaisseRemoteStockItem = {
  externalStockId?: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  raw: Record<string, unknown>;
};

function coerceString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function coerceNumber(value: unknown): number | undefined {
  return typeof value === "number"
    ? value
    : typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Number(value))
      ? Number(value)
      : undefined;
}

export function mapShopcaisseStockPayload(payload: unknown): ShopcaisseRemoteStockItem[] {
  if (!Array.isArray(payload)) {
    throw new ShopcaisseResponseError("Expected Shopcaisse stock payload to be an array.");
  }

  const mapped = payload.map((item): ShopcaisseRemoteStockItem | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const quantity =
        coerceNumber(raw.quantity) ?? coerceNumber(raw.stock) ?? coerceNumber(raw.availableStock);

      if (quantity === undefined) {
        return null;
      }

      return {
        externalStockId: coerceString(raw.externalStockId) ?? coerceString(raw.id),
        sku: coerceString(raw.sku) ?? coerceString(raw.reference),
        barcode: coerceString(raw.barcode) ?? coerceString(raw.ean),
        quantity,
        raw,
      };
    });

  return mapped.filter((item): item is ShopcaisseRemoteStockItem => item !== null);
}
