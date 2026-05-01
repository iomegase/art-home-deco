export interface PaymentService {
  createCheckoutSession(input: {
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; sessionId: string }>;
}
