import Link from "next/link";
import { formatPriceCents } from "@/features/product/format";
import { listCustomersAdmin } from "@/server/repositories/customer.repository";

export default async function AdminClientsPage() {
  const customers = await listCustomersAdmin();

  return (
    <section>
      <div>
        <p className="section-title text-terracotta">Clients</p>
        <h2 className="mt-2 font-serif text-4xl">Historique clients</h2>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Prenom</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Total cumule</th>
              <th className="px-4 py-3">Derniere commande</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-4 py-4">
                  <Link href={`/admin/clients/${customer.id}`} className="font-bold hover:text-terracotta">
                    {customer.firstName}
                  </Link>
                </td>
                <td className="px-4 py-4">{customer.lastName}</td>
                <td className="px-4 py-4">{customer.email}</td>
                <td className="px-4 py-4">{customer.phone ?? "—"}</td>
                <td className="px-4 py-4">{customer.orderCount}</td>
                <td className="px-4 py-4">{formatPriceCents(customer.totalSpentCents)}</td>
                <td className="px-4 py-4">
                  {customer.lastOrderAt ? new Intl.DateTimeFormat("fr-FR").format(customer.lastOrderAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
