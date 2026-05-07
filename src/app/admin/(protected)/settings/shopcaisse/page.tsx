import { getEnv } from "@/server/env";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";
import { ShopcaisseImportPanel } from "@/components/admin/shopcaisse-import-panel";

export default async function AdminShopcaisseSettingsPage() {
  const env = getEnv();
  const events = await listRecentIntegrationEvents("shopcaisse");
  const lastCatalogSuccess = events.find((event) => event.eventType === "catalog_sync" && event.status === "success");
  const lastCatalogError = events.find((event) => event.eventType === "catalog_sync" && event.status !== "success");
  const lastImportSuccess = events.find((event) => event.eventType === "catalog_import_products" && event.status === "success");
  const lastImportError = events.find((event) => event.eventType === "catalog_import_products" && event.status !== "success");

  const settings = [
    ["API base URL", Boolean(env.SHOPCAISSE_API_URL)],
    ["API key", Boolean(env.SHOPCAISSE_API_KEY)],
    ["Company ID", Boolean(env.SHOPCAISSE_COMPANY_ID)],
    ["Store ID", Boolean(env.SHOPCAISSE_STORE_ID)],
    ["POS ID", Boolean(env.SHOPCAISSE_POS_ID)],
    ["Webhook secret", Boolean(env.SHOPCAISSE_WEBHOOK_SECRET)],
    ["Signature header", Boolean(env.SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER ?? "x-server-authorization-hmac-sha256")],
  ] as const;

  return (
    <section className="grid gap-8">
      <div className="max-w-5xl">
        <p className="section-title text-terracotta">Shopcaisse</p>
        <h2 className="mt-2 font-serif text-4xl">Configuration integration</h2>
        <div className="mt-8 grid gap-3 border border-line bg-surface p-6 text-sm">
          {settings.map(([label, isSet]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span>{label}</span>
              <span className={isSet ? "font-bold text-accent" : "font-bold text-terracotta"}>
                {isSet ? "Configure" : "Manquant"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <ShopcaisseImportPanel
            lastCatalogSuccessAt={lastCatalogSuccess?.createdAt.toISOString()}
            lastCatalogErrorMessage={lastCatalogError?.message ?? undefined}
            lastImportSuccessAt={lastImportSuccess?.createdAt.toISOString()}
            lastImportErrorMessage={lastImportError?.message ?? undefined}
          />
        </div>

        <div className="mt-8">
          <h3 className="font-serif text-3xl">Evenements recents</h3>
          <div className="mt-6 grid gap-3">
            {events.map((event) => (
              <article key={event.id} className="border border-line p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <strong>{event.eventType}</strong>
                  <span>{event.status}</span>
                </div>
                {event.message ? <p className="mt-2 text-muted">{event.message}</p> : null}
              </article>
            ))}
            {events.length === 0 ? <p className="text-sm text-muted">Aucun evenement Shopcaisse pour le moment.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
