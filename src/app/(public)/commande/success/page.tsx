import Link from "next/link";
import type { Metadata } from "next";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { formatOrderStatus, formatShippingMethod } from "@/features/order/format";
import { formatPriceCents } from "@/features/product/format";
import { findOrderByStripeSessionId } from "@/server/repositories/order.repository";

export const metadata: Metadata = {
  title: "Commande confirmee",
};

type OrderSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await findOrderByStripeSessionId(sessionId) : null;

  return (
    <main className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <ClearCartOnMount />
      <p className="section-title text-terracotta">Paiement confirme</p>
      <h1 className="mt-3 font-serif text-5xl leading-none md:text-7xl">Merci pour votre commande.</h1>
      {order ? (
        <section className="mt-8 border border-line bg-surface p-6">
          <h2 className="font-serif text-3xl">{order.orderNumber}</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Statut</dt>
              <dd className="font-bold">{formatOrderStatus(order.orderStatus)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Livraison</dt>
              <dd className="font-bold">{formatShippingMethod(order.shippingMethod)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Total</dt>
              <dd className="font-bold">{formatPriceCents(order.totalCents)}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
          Le paiement a ete confirme. La commande est maintenant traitee cote serveur par le webhook Stripe.
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/boutique" className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Retour boutique
        </Link>
        <Link href="/contact" className="border border-line px-5 py-3 text-sm font-bold">
          Contacter la boutique
        </Link>
      </div>
    </main>
  );
}
