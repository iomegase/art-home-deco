import { runShopcaisseSyncAction } from "@/features/shopcaisse/actions";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";
import { listActiveProducts } from "@/server/repositories/catalog.repository";

export default async function AdminShopcaisseSyncPage() {
  const [events, products] = await Promise.all([
    listRecentIntegrationEvents("shopcaisse"),
    listActiveProducts(),
  ]);

  const syncedProducts = products.filter((product) => product.stockSource === "shopcaisse").length;

  return (
    <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <p className="section-title text-terracotta">Shopcaisse</p>
        <h2 className="mt-2 font-serif text-4xl">Synchronisation manuelle</h2>
        <div className="mt-8 border border-line bg-surface p-6">
          <p className="text-sm text-muted">
            Lance une lecture du endpoint explicite configure dans `SHOPCAISSE_STOCK_SYNC_URL`, mappe les
            produits via `externalStockId`, `sku` ou `barcode`, puis met a jour le cache local.
          </p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Produits actifs</dt>
              <dd className="font-bold">{products.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Source Shopcaisse</dt>
              <dd className="font-bold">{syncedProducts}</dd>
            </div>
          </dl>
          <form action={runShopcaisseSyncAction} className="mt-6">
            <button type="submit" className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
              Lancer la sync stock
            </button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-3xl">Journal integration</h3>
        <div className="mt-6 grid gap-3">
          {events.map((event) => (
            <article key={event.id} className="border border-line p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <strong>{event.eventType}</strong>
                <span>{event.status}</span>
              </div>
              {event.message ? <p className="mt-2 text-muted">{event.message}</p> : null}
              <p className="mt-2 text-xs text-muted">{new Date(event.createdAt).toLocaleString("fr-FR")}</p>
            </article>
          ))}
          {events.length === 0 ? <p className="text-sm text-muted">Aucune synchronisation enregistree.</p> : null}
        </div>
      </div>
    </section>
  );
}
