import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatOrderStatus, formatShippingMethod } from "@/features/order/format";
import { formatPriceCents } from "@/features/product/format";
import { getOrderByTrackingToken } from "@/server/repositories/customer-order.repository";

export const metadata: Metadata = {
  title: "Suivi de commande",
};

type OrderTrackingPageProps = {
  params: Promise<{ token: string }>;
};

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { token } = await params;
  const order = await getOrderByTrackingToken(token);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p className="section-title text-terracotta">Suivi commande</p>
      <h1 className="mt-3 font-serif text-5xl leading-none md:text-7xl">{order.orderNumber}</h1>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="border border-line bg-surface p-6">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Statut</dt>
              <dd className="font-bold">{formatOrderStatus(order.orderStatus)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Paiement</dt>
              <dd className="font-bold">{order.paymentStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Livraison</dt>
              <dd className="font-bold">{formatShippingMethod(order.shippingMethod)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Transporteur</dt>
              <dd className="font-bold">{order.carrier ?? "Non renseigne"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Numero de suivi</dt>
              <dd className="font-bold">{order.trackingNumber ?? "Non disponible"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Total</dt>
              <dd className="font-bold">{formatPriceCents(order.totalCents)}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <h2 className="font-serif text-3xl">Articles</h2>
            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
                  <span>
                    {item.quantity} x {item.title}
                  </span>
                  <span className="font-bold">{formatPriceCents(item.lineTotalCents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="border border-line bg-surface p-6">
          <h2 className="font-serif text-3xl">Adresse</h2>
          {order.shippingAddressLine1 ? (
            <div className="mt-4 space-y-1 text-sm">
              <p>{order.customerFirstName} {order.customerLastName}</p>
              <p>{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 ? <p>{order.shippingAddressLine2}</p> : null}
              <p>
                {order.shippingPostalCode} {order.shippingCity}
              </p>
              <p>{order.shippingCountry}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Aucune adresse enregistree pour cette commande.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
