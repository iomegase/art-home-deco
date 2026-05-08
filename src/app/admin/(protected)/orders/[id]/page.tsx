import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderFulfillmentAction } from "@/features/order/actions";
import { formatOrderStatus, formatShippingMethod } from "@/features/order/format";
import { formatPriceCents } from "@/features/product/format";
import { findOrderForAdmin } from "@/server/repositories/order.repository";
import { calculateOrderShippingEstimate } from "@/server/services/shipping/order-shipping";

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
};

const statuses = [
  "pending",
  "paid",
  "validated",
  "label_ready",
  "shipped",
  "delivered",
  "cancelled",
];

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const order = await findOrderForAdmin(id);

  if (!order) {
    notFound();
  }

  const shippingEstimate = calculateOrderShippingEstimate(order);

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div>
        <p className="section-title text-terracotta">Commande</p>
        <h2 className="mt-2 font-serif text-4xl">{order.orderNumber}</h2>

        <div className="mt-8 grid gap-4 border-y border-line py-6 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted">Client</span>
            <span className="font-bold">{order.customerFirstName} {order.customerLastName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Email</span>
            <span className="font-bold">{order.customerEmail}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Paiement</span>
            <span className="font-bold">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Statut</span>
            <span className="font-bold">{formatOrderStatus(order.orderStatus)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Livraison</span>
            <span className="font-bold">{formatShippingMethod(order.shippingMethod)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Tracking</span>
            <span className="font-bold">{order.trackingNumber ?? "Non renseigne"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Poids total estime</span>
            <span className="font-bold">
              {shippingEstimate.totalWeightKg} kg
              {shippingEstimate.usedFallbackWeight ? " (fallback partiel)" : ""}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Classe dominante</span>
            <span className="font-bold">{shippingEstimate.dominantShippingClass}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Transporteur</span>
            <span className="font-bold">{order.carrier ?? "Non renseigne"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Suivi client</span>
            <span className="font-bold">
              {order.trackingToken ? (
                <Link href={`/commande/suivi/${order.trackingToken}`} className="underline">
                  Ouvrir
                </Link>
              ) : (
                "Non disponible"
              )}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-serif text-3xl">Adresse de livraison</h3>
          {order.shippingAddressLine1 ? (
            <div className="mt-4 border border-line bg-surface p-5 text-sm">
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
        </div>

        <div className="mt-8">
          <h3 className="font-serif text-3xl">Articles</h3>
          <div className="mt-4 grid gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
                <span>{item.quantity} x {item.title}</span>
                <span className="font-bold">{formatPriceCents(item.lineTotalCents)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 max-w-md border border-line bg-surface p-5 text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPriceCents(order.subtotalCents)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Livraison</span>
            <span>{formatPriceCents(order.shippingCostCents)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-bold">
            <span>Total</span>
            <span>{formatPriceCents(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <aside className="h-fit border border-line bg-surface p-6">
        <h3 className="font-serif text-3xl">Traitement</h3>
        <form action={updateOrderFulfillmentAction} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={order.id} />
          <label className="text-sm font-bold">
            Statut
            <select
              name="orderStatus"
              defaultValue={order.orderStatus}
              className="mt-2 w-full border border-line bg-background px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            Numero de suivi
            <input
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              className="mt-2 w-full border border-line bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm font-bold">
            Transporteur
            <input
              name="carrier"
              defaultValue={order.carrier ?? "colissimo"}
              className="mt-2 w-full border border-line bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm font-bold">
            URL etiquette
            <input
              name="labelUrl"
              defaultValue={order.labelUrl ?? ""}
              className="mt-2 w-full border border-line bg-background px-3 py-2"
            />
          </label>
          {order.labelUrl ? (
            <a
              href={order.labelUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-4 py-2 text-center text-sm font-bold"
            >
              Imprimer l&apos;etiquette
            </a>
          ) : (
            <p className="text-sm text-muted">Etiquette non disponible.</p>
          )}
          <p className="text-sm text-muted">
            Quand l&apos;etiquette existe, passez la commande en “Etiquette prete”. Utilisez “Expediee” uniquement
            quand le colis est remis au transporteur.
          </p>
          <button type="submit" className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
            Mettre a jour
          </button>
        </form>
      </aside>
    </section>
  );
}
