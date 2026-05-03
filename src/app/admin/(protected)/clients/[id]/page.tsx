import { notFound } from "next/navigation";
import { formatOrderStatus, formatShippingMethod } from "@/features/order/format";
import { formatPriceCents } from "@/features/product/format";
import { getCustomerAdmin } from "@/server/repositories/customer.repository";

type AdminCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerPage({ params }: AdminCustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerAdmin(id);

  if (!customer) {
    notFound();
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <aside className="border border-line bg-surface p-6">
        <p className="section-title text-terracotta">Client</p>
        <h2 className="mt-2 font-serif text-4xl">
          {customer.firstName} {customer.lastName}
        </h2>
        <div className="mt-6 space-y-2 text-sm">
          <p><strong>Email :</strong> {customer.email}</p>
          <p><strong>Telephone :</strong> {customer.phone ?? "Non renseigne"}</p>
          <p><strong>Commandes :</strong> {customer.orders.length}</p>
          <p>
            <strong>Total cumule :</strong>{" "}
            {formatPriceCents(customer.orders.reduce((sum, order) => sum + order.totalCents, 0))}
          </p>
        </div>
      </aside>

      <div>
        <h3 className="font-serif text-3xl">Historique des commandes</h3>
        <div className="mt-5 grid gap-5">
          {customer.orders.map((order) => (
            <article key={order.id} className="border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-2xl">{order.orderNumber}</h4>
                  <p className="mt-1 text-sm text-muted">
                    {formatOrderStatus(order.orderStatus)} • {formatShippingMethod(order.shippingMethod)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{formatPriceCents(order.totalCents)}</p>
                  <p>{new Intl.DateTimeFormat("fr-FR").format(order.createdAt)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <p><strong>Tracking :</strong> {order.trackingNumber ?? "Non renseigne"}</p>
                <p>
                  <strong>Adresse :</strong>{" "}
                  {order.shippingAddressLine1
                    ? [
                        order.shippingAddressLine1,
                        order.shippingAddressLine2,
                        order.shippingPostalCode,
                        order.shippingCity,
                        order.shippingCountry,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "Non renseignee"}
                </p>
              </div>

              <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.quantity} x {item.title}
                    </span>
                    <span className="font-bold">{formatPriceCents(item.lineTotalCents)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
