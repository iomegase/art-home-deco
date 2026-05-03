import { getEnv } from "@/server/env";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";

export default async function AdminShopcaisseSettingsPage() {
  const env = getEnv();
  const events = await listRecentIntegrationEvents("shopcaisse");

  const settings = [
    ["API base URL", Boolean(env.SHOPCAISSE_API_URL)],
    ["API key", Boolean(env.SHOPCAISSE_API_KEY)],
    ["Store ID", Boolean(env.SHOPCAISSE_STORE_ID)],
    ["Webhook secret", Boolean(env.SHOPCAISSE_WEBHOOK_SECRET)],
    ["Signature header", Boolean(env.SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER ?? "x-server-authorization-hmac-sha256")],
  ] as const;

  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
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
      </div>

      <div>
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
    </section>
  );
}
