import Link from "next/link";
import { getEnv } from "@/server/env";
import { getAdminDashboardSnapshot } from "@/server/repositories/dashboard.repository";

const ACTIONS = [
  { label: "Produits", href: "/admin/products", color: "#f97316", bg: "#fff1e6" },
  { label: "Articles blog", href: "/admin/blog", color: "#ec4899", bg: "#fdecf4" },
  { label: "Brouillon IA", href: "/admin/blog/new", color: "#8b5cf6", bg: "#f3efff" },
  { label: "Commandes", href: "/admin/orders", color: "#10b981", bg: "#e9faf2" },
  { label: "Clients", href: "/admin/clients", color: "#ef4444", bg: "#fdecec" },
  { label: "Paramètres", href: "/admin/settings", color: "#64748b", bg: "#f1f3f6" },
  { label: "Shopcaisse settings", href: "/admin/settings/shopcaisse", color: "#f97316", bg: "#fff1e6" },
  { label: "Sync Shopcaisse", href: "/admin/sync/shopcaisse", color: "#f97316", bg: "#fff1e6" },
  { label: "Export events", href: "/api/admin/integrations/export", color: "#ef4444", bg: "#fdecec" },
];

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#f3f3f5] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{title}</p>
          {subtitle ? <p className="mt-1 text-[12px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function AdminHomePage() {
  const env = getEnv();
  const snapshot = await getAdminDashboardSnapshot();

  const stats = [
    { label: "Produits", value: snapshot.productCount, color: "#f97316", bg: "#fff1e6" },
    { label: "Commandes", value: snapshot.orderCount, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Payées", value: snapshot.paidOrders, color: "#10b981", bg: "#e9faf2" },
    { label: "Articles", value: snapshot.blogPostCount, color: "#ec4899", bg: "#fdecf4" },
  ];

  const integrations = [
    {
      label: "Stripe",
      status: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
    },
    {
      label: "Resend",
      status: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    },
    {
      label: "Shopcaisse",
      status: Boolean(
        env.SHOPCAISSE_API_URL &&
          env.SHOPCAISSE_API_KEY &&
          env.SHOPCAISSE_COMPANY_ID &&
          env.SHOPCAISSE_STORE_ID &&
          env.SHOPCAISSE_POS_ID,
      ),
    },
    {
      label: "Gemini AI",
      status: Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY ?? env.GEMINI_API_KEY),
    },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 pb-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{greeting} · Art Home Déco</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Dashboard</h1>
          <span className="text-[11px] text-slate-500">
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="relative overflow-hidden bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: stat.color }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
            <p className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <SectionCard title="Actions rapides" subtitle="Accès direct aux tâches du back-office">
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition hover:brightness-95"
                  style={{ backgroundColor: action.bg, color: action.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: action.color }} />
                  {action.label}
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Événements récents" subtitle="Derniers statuts des intégrations">
            {snapshot.recentEvents.length === 0 ? (
              <p className="text-[12px] text-slate-500">Aucun événement enregistré.</p>
            ) : (
              <div className="grid gap-2">
                {snapshot.recentEvents.map((event) => {
                  const color = event.status === "success" ? "#10b981" : event.status === "error" ? "#ef4444" : "#f97316";

                  return (
                    <article key={event.id} className="bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold text-[#0f1115]">{event.provider}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ color, backgroundColor: `${color}1A` }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-slate-600">{event.eventType}</p>
                      {event.message ? <p className="mt-1 text-[11px] text-slate-500">{event.message}</p> : null}
                    </article>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="self-start lg:sticky lg:top-6">
          <div className="grid gap-6">
            <SectionCard title="Intégrations" subtitle="État de configuration des services">
              <div className="grid gap-2">
                {integrations.map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-white px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <span className="text-[12px] font-medium text-[#0f1115]">{item.label}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={item.status ? { color: "#10b981", backgroundColor: "#e9faf2" } : { color: "#ef4444", backgroundColor: "#fdecec" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.status ? "#10b981" : "#ef4444" }} />
                      {item.status ? "Actif" : "À configurer"}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </aside>
      </div>
    </div>
  );
}
