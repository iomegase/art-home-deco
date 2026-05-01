export function formatPriceCents(priceCents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100);
}

export function formatStockLabel(stock: number, pickupOnly: boolean): string {
  if (stock <= 0) {
    return "Rupture";
  }

  if (pickupOnly) {
    return "Retrait boutique";
  }

  return `${stock} en stock`;
}
