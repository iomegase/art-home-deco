import Link from "next/link";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";
import { listActiveProducts } from "@/server/repositories/catalog.repository";
import { ShopcaisseDashboard } from "./shopcaisse-dashboard";

function fmtDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export default async function AdminShopcaissePage() {
  const [events, products] = await Promise.all([listRecentIntegrationEvents("shopcaisse"), listActiveProducts()]);

  const linkedProducts = products.filter((p) => p.stockSource === "shopcaisse" || Boolean(p.externalStockId)).length;
  const successCount = events.filter((e) => e.status === "success").length;
  const errorCount = events.filter((e) => e.status === "error").length;
  const pendingCount = events.filter((e) => e.status === "pending").length;

  const byType = new Map<string, number>();
  for (const event of events) {
    byType.set(event.eventType, (byType.get(event.eventType) ?? 0) + 1);
  }
  const typeData = Array.from(byType.entries())
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const byDay = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay.set(fmtDate(d), 0);
  }
  for (const event of events) {
    const key = fmtDate(event.createdAt);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const timelineData = Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));

  const latestEvents = events.slice(0, 8).map((e) => ({
    id: e.id,
    eventType: e.eventType,
    status: e.status,
    message: e.message,
    createdAt: e.createdAt.toLocaleString("fr-FR"),
  }));

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 pb-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Intégration</p>
        <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Shopcaisse</h1>
        <p className="mt-2 text-[12px] text-slate-500">Pilotage de la synchronisation catalogue/stock et suivi des événements.</p>
      </div>

      <ShopcaisseDashboard
        totals={{
          products: products.length,
          linkedProducts,
          successCount,
          errorCount,
          pendingCount,
        }}
        typeData={typeData}
        timelineData={timelineData}
        latestEvents={latestEvents}
      />

      <div className="bg-white p-4 text-[12px] text-slate-600 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        Besoin d&apos;actions techniques ?
        <Link href="/admin/settings/shopcaisse" className="ml-2 font-semibold text-[#7c3aed] hover:underline">
          Ouvrir la configuration Shopcaisse
        </Link>
      </div>
    </div>
  );
}
