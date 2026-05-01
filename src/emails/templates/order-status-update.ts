type OrderStatusEmailInput = {
  orderNumber: string;
  customerFirstName: string;
  trackingNumber?: string | null;
};

export function renderReadyForPickupEmail(input: OrderStatusEmailInput) {
  return `
    <main style="font-family: Arial, sans-serif; color: #171714;">
      <h1>Commande prete au retrait</h1>
      <p>Bonjour ${input.customerFirstName},</p>
      <p>Votre commande ${input.orderNumber} est prete a etre retiree en boutique.</p>
    </main>
  `;
}

export function renderOrderShippedEmail(input: OrderStatusEmailInput) {
  return `
    <main style="font-family: Arial, sans-serif; color: #171714;">
      <h1>Commande expediee</h1>
      <p>Bonjour ${input.customerFirstName},</p>
      <p>Votre commande ${input.orderNumber} a ete expediee.</p>
      ${input.trackingNumber ? `<p>Numero de suivi: <strong>${input.trackingNumber}</strong></p>` : ""}
    </main>
  `;
}
