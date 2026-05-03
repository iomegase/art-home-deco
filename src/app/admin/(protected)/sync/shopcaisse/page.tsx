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
            L&apos;integration EasyShop est maintenant pilotee par le webhook officiel signe HMAC. La mise a
            jour locale du stock se fait a reception des evenements `company.items`.
          </p>
          <p className="mt-3 text-sm text-muted">
            Une synchronisation manuelle sortante n&apos;est pas exposee tant que l&apos;endpoint public EasyShop
            de lecture catalogue/stock n&apos;est pas documente proprement.
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
