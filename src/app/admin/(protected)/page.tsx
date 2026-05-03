import Link from "next/link";
import { getEnv } from "@/server/env";
import { getAdminDashboardSnapshot } from "@/server/repositories/dashboard.repository";

export default async function AdminHomePage() {
  const env = getEnv();
  const snapshot = await getAdminDashboardSnapshot();

  const integrations = [
    { label: "Stripe", status: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) },
    { label: "Resend", status: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM) },
    { label: "Shopcaisse", status: Boolean(env.SHOPCAISSE_API_URL && env.SHOPCAISSE_API_KEY && env.SHOPCAISSE_WEBHOOK_SECRET) },
    { label: "Gemini", status: Boolean(env.GEMINI_API_KEY) },
  ];

  return (
    <section className="grid gap-8">
      <div>
        <p className="section-title text-terracotta">Pilotage</p>
        <h2 className="mt-2 font-serif text-4xl">Dashboard exploitation</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Produits</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.productCount}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Commandes</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.orderCount}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Commandes payees</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.paidOrders}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Articles blog</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.blogPostCount}</p>
        </article>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="font-serif text-3xl">Integrations</h3>
          <div className="mt-5 grid gap-3">
            {integrations.map((item) => (
              <div key={item.label} className="flex items-center justify-between border border-line px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className={item.status ? "font-bold text-accent" : "font-bold text-terracotta"}>
                  {item.status ? "Pret" : "A configurer"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/clients" className="border border-line px-4 py-2 text-sm font-bold">
              Clients
            </Link>
            <Link href="/admin/blog" className="border border-line px-4 py-2 text-sm font-bold">
              Articles blog
            </Link>
            <Link href="/admin/blog/new" className="border border-line px-4 py-2 text-sm font-bold">
              Brouillon IA blog
            </Link>
            <Link href="/admin/settings/shopcaisse" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
              Settings Shopcaisse
            </Link>
            <Link href="/admin/sync/shopcaisse" className="border border-line px-4 py-2 text-sm font-bold">
              Sync Shopcaisse
            </Link>
            <a href="/api/admin/integrations/export" className="border border-line px-4 py-2 text-sm font-bold">
              Export events
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-3xl">Evenements recents</h3>
          <div className="mt-5 grid gap-3">
            {snapshot.recentEvents.map((event) => (
              <article key={event.id} className="border border-line p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <strong>{event.provider}</strong>
                  <span>{event.status}</span>
                </div>
                <p className="mt-1">{event.eventType}</p>
                {event.message ? <p className="mt-2 text-muted">{event.message}</p> : null}
              </article>
            ))}
            {snapshot.recentEvents.length === 0 ? (
              <p className="text-sm text-muted">Aucun evenement d&apos;integration enregistre.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
