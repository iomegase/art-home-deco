import { formatPriceCents } from "@/features/product/format";

type OrderConfirmationEmailInput = {
  orderNumber: string;
  customerFirstName: string;
  totalCents: number;
  shippingMethod: string;
  items: Array<{
    title: string;
    quantity: number;
    lineTotalCents: number;
  }>;
};

export function renderOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
  const items = input.items
    .map(
      (item) =>
        `<li>${item.quantity} x ${item.title} - ${formatPriceCents(item.lineTotalCents)}</li>`,
    )
    .join("");

  return `
    <main style="font-family: Arial, sans-serif; color: #171714;">
      <h1>Commande confirmee</h1>
      <p>Bonjour ${input.customerFirstName},</p>
      <p>Votre commande ${input.orderNumber} est payee et en cours de preparation.</p>
      <ul>${items}</ul>
      <p><strong>Total: ${formatPriceCents(input.totalCents)}</strong></p>
      <p>Mode de livraison: ${input.shippingMethod}</p>
    </main>
  `;
}
