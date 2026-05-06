import { formatPriceCents } from "@/features/product/format";
import { getAdminAnalyticsSnapshot } from "@/server/repositories/dashboard.repository";

function formatPercent(value: number) {
  return `${value.toFixed(1)} %`;
}

function formatSeoPercent(value: number) {
  return `${(value * 100).toFixed(1)} %`;
}

export default async function AdminAnalyticsPage() {
  const snapshot = await getAdminAnalyticsSnapshot();

  return (
    <section className="grid gap-8">
      <div>
        <p className="section-title text-terracotta">Analytics</p>
        <h2 className="mt-2 font-serif text-4xl">Performance 30 derniers jours</h2>
        <p className="mt-2 text-sm text-muted">
          Periode: {snapshot.periodStart.toLocaleDateString("fr-FR")} - {snapshot.periodEnd.toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Checkouts demarres</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.checkoutStarted30d}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Commandes payees</p>
          <p className="mt-2 font-serif text-4xl">{snapshot.paidOrders30d}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">Conversion checkout → paid</p>
          <p className="mt-2 font-serif text-4xl">{formatPercent(snapshot.checkoutToPaidConversion)}</p>
        </article>
        <article className="border border-line bg-surface p-5">
          <p className="text-sm text-muted">CA paye</p>
          <p className="mt-2 font-serif text-4xl">{formatPriceCents(snapshot.revenue30dCents)}</p>
        </article>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <h3 className="font-serif text-3xl">Commandes par mode de livraison</h3>
          <div className="mt-5 grid gap-3 text-sm">
            {snapshot.ordersByShippingMethod.map((item) => (
              <div key={item.shippingMethod} className="flex items-center justify-between border border-line px-4 py-3">
                <span>{item.shippingMethod}</span>
                <strong>{item._count._all}</strong>
              </div>
            ))}
            {snapshot.ordersByShippingMethod.length === 0 ? (
              <p className="text-muted">Aucune commande sur la periode.</p>
            ) : null}
          </div>
        </div>

        <div className="border border-line bg-surface p-5">
          <h3 className="font-serif text-3xl">Events integration par provider</h3>
          <div className="mt-5 grid gap-3 text-sm">
            {snapshot.eventsByProvider.map((item) => (
              <div key={item.provider} className="flex items-center justify-between border border-line px-4 py-3">
                <span>{item.provider}</span>
                <strong>{item._count._all}</strong>
              </div>
            ))}
            {snapshot.eventsByProvider.length === 0 ? (
              <p className="text-muted">Aucun evenement d&apos;integration sur la periode.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border border-line bg-surface p-5">
        <h3 className="font-serif text-3xl">Top events integration</h3>
        <div className="mt-5 grid gap-3 text-sm">
          {snapshot.eventsByType.map((item) => (
            <div key={item.eventType} className="flex items-center justify-between border border-line px-4 py-3">
              <span>{item.eventType}</span>
              <strong>{item._count._all}</strong>
            </div>
          ))}
          {snapshot.eventsByType.length === 0 ? (
            <p className="text-muted">Aucun event type enregistre sur la periode.</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-3xl">Google Analytics 4</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {snapshot.googleAnalytics.status}
            </span>
          </div>

          {snapshot.googleAnalytics.status === "ok" && snapshot.googleAnalytics.summary ? (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Users</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.googleAnalytics.summary.users}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Sessions</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.googleAnalytics.summary.sessions}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Views</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.googleAnalytics.summary.views}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Purchases</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.googleAnalytics.summary.purchases}</p>
                </article>
                <article className="border border-line px-4 py-3 md:col-span-2 xl:col-span-2">
                  <p className="text-xs text-muted">Purchase revenue</p>
                  <p className="mt-1 font-serif text-3xl">
                    {formatPriceCents(Math.round(snapshot.googleAnalytics.summary.purchaseRevenue * 100))}
                  </p>
                </article>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Top channels</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    {snapshot.googleAnalytics.channels?.map((item) => (
                      <div key={item.channel} className="flex items-center justify-between border border-line px-4 py-3">
                        <span>{item.channel}</span>
                        <strong>{item.sessions} sessions</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Top pages</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    {snapshot.googleAnalytics.pages?.map((item) => (
                      <div key={item.path} className="flex items-center justify-between gap-4 border border-line px-4 py-3">
                        <span className="truncate">{item.path}</span>
                        <strong>{item.views} vues</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {snapshot.googleAnalytics.status === "not_configured" ? (
            <p className="mt-5 text-sm text-muted">
              GA4 live non configure. Renseigner `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
              et `GOOGLE_ANALYTICS_PROPERTY_ID`.
            </p>
          ) : null}

          {snapshot.googleAnalytics.status === "error" ? (
            <p className="mt-5 text-sm text-terracotta">{snapshot.googleAnalytics.error}</p>
          ) : null}
        </section>

        <section className="border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-3xl">Google Search Console</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {snapshot.searchConsole.status}
            </span>
          </div>

          {snapshot.searchConsole.status === "ok" && snapshot.searchConsole.summary ? (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Clicks</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.searchConsole.summary.clicks}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Impressions</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.searchConsole.summary.impressions}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">CTR</p>
                  <p className="mt-1 font-serif text-3xl">{formatSeoPercent(snapshot.searchConsole.summary.ctr)}</p>
                </article>
                <article className="border border-line px-4 py-3">
                  <p className="text-xs text-muted">Position</p>
                  <p className="mt-1 font-serif text-3xl">{snapshot.searchConsole.summary.position.toFixed(1)}</p>
                </article>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Top queries</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    {snapshot.searchConsole.queries?.map((item) => (
                      <div key={item.query} className="flex items-center justify-between gap-4 border border-line px-4 py-3">
                        <span className="truncate">{item.query}</span>
                        <strong>{item.clicks} clics</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Top pages SEO</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    {snapshot.searchConsole.pages?.map((item) => (
                      <div key={item.page} className="flex items-center justify-between gap-4 border border-line px-4 py-3">
                        <span className="truncate">{item.page}</span>
                        <strong>{item.clicks} clics</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {snapshot.searchConsole.status === "not_configured" ? (
            <p className="mt-5 text-sm text-muted">
              Search Console live non configure. Renseigner `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
              `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` et `GOOGLE_SEARCH_CONSOLE_SITE_URL`.
            </p>
          ) : null}

          {snapshot.searchConsole.status === "error" ? (
            <p className="mt-5 text-sm text-terracotta">{snapshot.searchConsole.error}</p>
          ) : null}
        </section>
      </div>
    </section>
  );
}
