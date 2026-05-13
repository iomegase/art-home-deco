import { getEnv } from "@/server/env";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";
import { ShopcaisseImportPanel } from "@/components/admin/shopcaisse-import-panel";
import { ShopcaisseSettingsDashboard } from "./shopcaisse-settings-dashboard";

export default async function AdminShopcaisseSettingsPage() {
  const env = getEnv();
  const events = await listRecentIntegrationEvents("shopcaisse");

  const lastCatalogSuccess = events.find((event) => event.eventType === "catalog_sync" && event.status === "success");
  const lastCatalogError = events.find((event) => event.eventType === "catalog_sync" && event.status !== "success");
  const lastImportSuccess = events.find(
    (event) => event.eventType === "catalog_import_products" && event.status === "success",
  );
  const lastImportError = events.find(
    (event) => event.eventType === "catalog_import_products" && event.status !== "success",
  );

  const settings = [
    ["API base URL", Boolean(env.SHOPCAISSE_API_URL)],
    ["API key", Boolean(env.SHOPCAISSE_API_KEY)],
    ["Company ID", Boolean(env.SHOPCAISSE_COMPANY_ID)],
    ["Store ID", Boolean(env.SHOPCAISSE_STORE_ID)],
    ["POS ID", Boolean(env.SHOPCAISSE_POS_ID)],
    ["Webhook secret", Boolean(env.SHOPCAISSE_WEBHOOK_SECRET)],
    [
      "Signature header",
      Boolean(env.SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER ?? "x-server-authorization-hmac-sha256"),
    ],
  ] as const;

  const success = events.filter((event) => event.status === "success").length;
  const error = events.filter((event) => event.status === "error").length;
  const pending = events.filter((event) => event.status === "pending").length;

  return (
    <section className="grid gap-8 pb-8 [&_p]:text-[12px] [&_a]:text-[12px]">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Panneau de gestion</p>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#bd6a45]">Shopcaisse</p>
        <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Configuration intégration</h1>
        <p className="mt-3 max-w-3xl text-[12px] text-slate-500">
          Pilotage de la connexion API, visualisation des événements et onboarding d&apos;import catalogue.
        </p>
      </header>

      <ShopcaisseSettingsDashboard
        configItems={settings.map(([label, isSet]) => ({ label, isSet }))}
        totals={{ events: events.length, success, error, pending }}
      />

      <div className="grid gap-6">
        <ShopcaisseImportPanel
          lastCatalogSuccessAt={lastCatalogSuccess?.createdAt.toISOString()}
          lastCatalogErrorMessage={lastCatalogError?.message ?? undefined}
          lastImportSuccessAt={lastImportSuccess?.createdAt.toISOString()}
          lastImportErrorMessage={lastImportError?.message ?? undefined}
        />
      </div>

      <aside className="bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Journal</p>
        <h3 className="mt-2 text-[24px] font-[300] leading-none tracking-[-0.02em] text-[#111]">Événements récents</h3>

        <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const statusClasses =
              event.status === "success"
                ? "bg-emerald-50 text-emerald-600"
                : event.status === "error"
                  ? "bg-rose-50 text-rose-500"
                  : "bg-amber-50 text-amber-600";

            return (
              <article key={event.id} className="rounded-2xl border border-[#ececef] bg-[#fafafa] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[12px] font-semibold text-[#111]">{event.eventType}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusClasses}`}>
                    {event.status}
                  </span>
                </div>
                {event.message ? <p className="mt-1 text-[11px] text-slate-500">{event.message}</p> : null}
                <p className="mt-1 text-[10px] text-slate-400">{event.createdAt.toLocaleString("fr-FR")}</p>
              </article>
            );
          })}
          {events.length === 0 ? <p className="text-[12px] text-slate-500">Aucun événement Shopcaisse pour le moment.</p> : null}
        </div>
      </aside>
    </section>
  );
}
