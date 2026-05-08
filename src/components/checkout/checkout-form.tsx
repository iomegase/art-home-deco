"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackAddShippingInfo, trackBeginCheckout } from "@/lib/analytics/ecommerce";
import { readCart } from "@/features/cart/storage";

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const shippingMethod = searchParams.get("shipping") ?? "pickup";

  useEffect(() => {
    const cartItems = readCart();
    if (cartItems.length === 0) {
      return;
    }

    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems, shippingMethod }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        const payload = await response.json();
        return payload.quote as
          | {
              totalCents: number;
              lines: Array<{ productId: string; title: string; unitPriceCents: number; quantity: number; sku: string }>;
            }
          | undefined;
      })
      .then((quote) => {
        if (!quote) {
          return;
        }

        const cart = {
          currency: "EUR" as const,
          value: quote.totalCents / 100,
          items: quote.lines.map((line) => ({
            item_id: line.productId,
            item_name: line.title,
            price: line.unitPriceCents / 100,
            quantity: line.quantity,
            sku: line.sku,
          })),
        };

        trackBeginCheckout(cart);
        trackAddShippingInfo(cart, shippingMethod);
      })
      .catch(() => {
        return;
      });
  }, [shippingMethod]);

  async function submitCheckout(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: readCart(),
        shippingMethod,
        customer: {
          email: String(formData.get("email") ?? ""),
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          addressLine1: String(formData.get("addressLine1") ?? ""),
          addressLine2: String(formData.get("addressLine2") ?? ""),
          postalCode: String(formData.get("postalCode") ?? ""),
          city: String(formData.get("city") ?? ""),
          country: String(formData.get("country") ?? "France"),
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setSubmitting(false);
      setError(payload.error ?? "Impossible de lancer le paiement.");
      return;
    }

    if (payload.checkoutUrl) {
      window.location.href = payload.checkoutUrl;
      return;
    }

    setSubmitting(false);
    setError("Stripe n'est pas encore configure pour ce projet.");
  }

  return (
    <>
      {submitting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-surface p-8 text-center shadow-lg">
            <p className="section-title text-terracotta">Paiement en cours</p>
            <h2 className="mt-3 font-serif text-4xl">Redirection vers Stripe</h2>
            <p className="mt-4 text-sm text-muted">
              Nous preparons votre paiement securise. Cette etape peut prendre quelques secondes.
            </p>
          </div>
        </div>
      ) : null}
      <form action={submitCheckout} className="max-w-2xl space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Prenom
          <input name="firstName" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
        </label>
        <label className="block text-sm font-bold">
          Nom
          <input name="lastName" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
        </label>
        </div>
        <label className="block text-sm font-bold">
        Email
        <input name="email" type="email" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
        </label>
        <label className="block text-sm font-bold">
        Telephone
        <input name="phone" disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
        </label>
        {shippingMethod !== "pickup" ? (
          <>
            <label className="block text-sm font-bold">
              Adresse
              <input name="addressLine1" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
            </label>
            <label className="block text-sm font-bold">
              Complement d&apos;adresse
              <input name="addressLine2" disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                Code postal
                <input name="postalCode" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
              </label>
              <label className="block text-sm font-bold">
                Ville
                <input name="city" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
              </label>
            </div>
            <label className="block text-sm font-bold">
              Pays
              <input name="country" defaultValue="France" required disabled={submitting} className="mt-2 w-full border border-line bg-background px-3 py-3 disabled:opacity-60" />
            </label>
          </>
        ) : null}
        {submitting ? (
          <p className="border border-line bg-surface p-4 text-sm font-bold">
            Paiement en cours. Redirection vers Stripe...
          </p>
        ) : null}
        {error ? <p className="border border-line bg-surface p-4 text-sm font-bold">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand px-6 py-4 text-sm font-bold text-brand-contrast disabled:cursor-not-allowed disabled:bg-muted"
        >
          {submitting ? "Preparation du paiement..." : "Continuer vers Stripe"}
        </button>
      </form>
    </>
  );
}
