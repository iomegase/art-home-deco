import type { OrderStatus, ShippingMethod } from "@/types/domain";

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payee",
  preparing: "En preparation",
  ready_for_pickup: "Prete au retrait",
  shipped: "Expediee",
  completed: "Terminee",
  cancelled: "Annulee",
};

const shippingMethodLabels: Record<ShippingMethod, string> = {
  pickup: "Retrait boutique",
  colissimo_home: "Colissimo domicile",
  colissimo_pickup: "Colissimo point retrait",
};

export function formatOrderStatus(status: string): string {
  return orderStatusLabels[status as OrderStatus] ?? status;
}

export function formatShippingMethod(method: string): string {
  return shippingMethodLabels[method as ShippingMethod] ?? method;
}
