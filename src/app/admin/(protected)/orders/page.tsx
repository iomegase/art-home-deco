import Link from "next/link";
import { formatOrderStatus, formatShippingMethod } from "@/features/order/format";
import { formatPriceCents } from "@/features/product/format";
import { listOrdersForAdmin } from "@/server/repositories/order.repository";

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Commandes</p>
          <h2 className="mt-2 font-serif text-4xl">Suivi commandes</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/admin/orders/coliship-export?format=expeditions-pro"
            className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast"
          >
            Exporter Expéditions Pro
          </a>
          <a
            href="/api/admin/orders/coliship-export?format=coliship-classic"
            className="border border-line px-4 py-2 text-sm font-bold"
          >
            Exporter ColiShip classique
          </a>
          <a
            href="/api/admin/orders/export"
            className="border border-line px-4 py-2 text-sm font-bold"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Livraison</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-bold hover:text-terracotta">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-4">{order.customerEmail}</td>
                <td className="px-4 py-4">{order.paymentStatus}</td>
                <td className="px-4 py-4">{formatOrderStatus(order.orderStatus)}</td>
                <td className="px-4 py-4">{order.trackingNumber ?? "—"}</td>
                <td className="px-4 py-4">{formatShippingMethod(order.shippingMethod)}</td>
                <td className="px-4 py-4">{formatPriceCents(order.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
