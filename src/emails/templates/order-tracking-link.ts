import { formatPriceCents } from "@/features/product/format";

type OrderTrackingLinkEmailInput = {
  orderNumber: string;
  customerFirstName: string;
  totalCents: number;
  shippingMethod: string;
  trackingUrl: string;
  items: Array<{
    title: string;
    quantity: number;
    lineTotalCents: number;
  }>;
};

export function renderOrderTrackingLinkEmail(input: OrderTrackingLinkEmailInput) {
  const items = input.items
    .map((item) => `<li>${item.quantity} x ${item.title} - ${formatPriceCents(item.lineTotalCents)}</li>`)
    .join("");

  return `
    <main style="font-family: Arial, sans-serif; color: #171714;">
      <h1>Commande confirmee</h1>
      <p>Bonjour ${input.customerFirstName},</p>
      <p>Votre paiement pour la commande <strong>${input.orderNumber}</strong> a ete valide.</p>
      <p>Un suivi prive de votre commande est disponible ici :</p>
      <p><a href="${input.trackingUrl}">${input.trackingUrl}</a></p>
      <ul>${items}</ul>
      <p><strong>Total: ${formatPriceCents(input.totalCents)}</strong></p>
      <p>Mode de livraison: ${input.shippingMethod}</p>
    </main>
  `;
}
