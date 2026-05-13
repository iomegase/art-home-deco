import { formatPriceCents } from "@/features/product/format";
import { getAdminAnalyticsSnapshot } from "@/server/repositories/dashboard.repository";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AdminAnalyticsPage() {
  const snapshot = await getAdminAnalyticsSnapshot();

  return (
    <div className="grid gap-10">

      {/* ── Header ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Performance
        </p>
        <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">
          Analytics
        </h1>
      </div>

      {/* ── Animated charts (client) ── */}
      <AnalyticsCharts
        period={{
          start: snapshot.periodStart.toLocaleDateString("fr-FR"),
          end:   snapshot.periodEnd.toLocaleDateString("fr-FR"),
        }}
        checkoutStarted30d={snapshot.checkoutStarted30d}
        paidOrders30d={snapshot.paidOrders30d}
        checkoutToPaidConversion={snapshot.checkoutToPaidConversion}
        revenue30d={formatPriceCents(snapshot.revenue30dCents)}
        ordersByShipping={snapshot.ordersByShippingMethod}
        eventsByProvider={snapshot.eventsByProvider}
        eventsByType={snapshot.eventsByType}
        ga4={{
          status:   snapshot.googleAnalytics.status,
          summary:  snapshot.googleAnalytics.summary,
          channels: snapshot.googleAnalytics.channels,
          pages:    snapshot.googleAnalytics.pages,
          error:    snapshot.googleAnalytics.error,
        }}
        gsc={{
          status:   snapshot.searchConsole.status,
          summary:  snapshot.searchConsole.summary,
          queries:  snapshot.searchConsole.queries,
          pages:    snapshot.searchConsole.pages,
          error:    snapshot.searchConsole.error,
        }}
      />
    </div>
  );
}
