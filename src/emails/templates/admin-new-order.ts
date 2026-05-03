import { formatPriceCents } from "@/features/product/format";

type AdminNewOrderEmailInput = {
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  totalCents: number;
  shippingMethod: string;
  items: Array<{
    title: string;
    quantity: number;
    lineTotalCents: number;
  }>;
};

export function renderAdminNewOrderEmail(input: AdminNewOrderEmailInput) {
  const items = input.items
    .map((item) => `<li>${item.quantity} x ${item.title} - ${formatPriceCents(item.lineTotalCents)}</li>`)
    .join("");

  return `
    <main style="font-family: Arial, sans-serif; color: #171714;">
      <h1>Nouvelle commande payee</h1>
      <p><strong>${input.orderNumber}</strong></p>
      <p>Client: ${input.customerFirstName} ${input.customerLastName} (${input.customerEmail})</p>
      <p>Mode de livraison: ${input.shippingMethod}</p>
      <ul>${items}</ul>
      <p><strong>Total: ${formatPriceCents(input.totalCents)}</strong></p>
    </main>
  `;
}
