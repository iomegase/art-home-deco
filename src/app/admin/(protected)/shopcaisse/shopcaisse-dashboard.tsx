"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Totals = {
  products: number;
  linkedProducts: number;
  successCount: number;
  errorCount: number;
  pendingCount: number;
};

type Props = {
  totals: Totals;
  typeData: Array<{ eventType: string; count: number }>;
  timelineData: Array<{ day: string; count: number }>;
  latestEvents: Array<{ id: string; eventType: string; status: string; message?: string | null; createdAt: string }>;
};

const CARD = "bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)]";
const EASE = [0.22, 1, 0.36, 1] as const;

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className={`relative overflow-hidden ${CARD}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: color }} />
      <p className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]" style={{ color }}>
        {value}
      </p>
    </motion.article>
  );
}

export function ShopcaisseDashboard({ totals, typeData, timelineData, latestEvents }: Props) {
  const statusData = [
    { name: "success", value: totals.successCount, color: "#10b981" },
    { name: "pending", value: totals.pendingCount, color: "#f97316" },
    { name: "error", value: totals.errorCount, color: "#ef4444" },
  ].filter((x) => x.value > 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Produits actifs" value={totals.products} color="#3b82f6" />
        <Kpi label="Liés Shopcaisse" value={totals.linkedProducts} color="#7c3aed" />
        <Kpi label="Évts success" value={totals.successCount} color="#10b981" />
        <Kpi label="Évts pending" value={totals.pendingCount} color="#f97316" />
        <Kpi label="Évts error" value={totals.errorCount} color="#ef4444" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35, ease: EASE }} className={CARD}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Événements par type</p>
          <p className="text-[11px] text-slate-500">Top des événements reçus</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid vertical={false} stroke="#f3f3f5" />
                <XAxis dataKey="eventType" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ fill: "#fafafa" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#7c3aed" isAnimationActive animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.35, ease: EASE }} className={CARD}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Activité 7 jours</p>
          <p className="text-[11px] text-slate-500">Nombre d&apos;événements Shopcaisse / jour</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid vertical={false} stroke="#f3f3f5" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ stroke: "#e5e7eb" }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} isAnimationActive animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35, ease: EASE }} className={CARD}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Répartition statuts</p>
          <p className="text-[11px] text-slate-500">Success / Pending / Error</p>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84} paddingAngle={3} isAnimationActive animationDuration={700}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.35, ease: EASE }} className={CARD}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Événements récents</p>
          <p className="text-[11px] text-slate-500">Journal d&apos;intégration Shopcaisse</p>
          <div className="mt-4 grid gap-2">
            {latestEvents.length === 0 ? (
              <p className="text-[12px] text-slate-500">Aucun événement pour le moment.</p>
            ) : (
              latestEvents.map((event) => {
                const style =
                  event.status === "success"
                    ? { color: "#10b981", bg: "#e9faf2" }
                    : event.status === "error"
                      ? { color: "#ef4444", bg: "#fdecec" }
                      : { color: "#f97316", bg: "#fff1e6" };

                return (
                  <article key={event.id} className="rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-[#0f1115]">{event.eventType}</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ color: style.color, backgroundColor: style.bg }}>
                        {event.status}
                      </span>
                    </div>
                    {event.message ? <p className="mt-1 text-[11px] text-slate-500">{event.message}</p> : null}
                    <p className="mt-1 text-[10px] text-slate-400">{event.createdAt}</p>
                  </article>
                );
              })
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
