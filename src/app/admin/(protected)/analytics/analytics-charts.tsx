"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type ShippingItem  = { shippingMethod: string; _count: { _all: number } };
type ProviderItem  = { provider:       string; _count: { _all: number } };
type EventTypeItem = { eventType:      string; _count: { _all: number } };

type GA4Summary  = { users: number; sessions: number; views: number; purchases: number; purchaseRevenue: number };
type GA4Channel  = { channel: string; sessions: number };
type GA4Page     = { path: string; views: number };
type GscSummary  = { clicks: number; impressions: number; ctr: number; position: number };
type GscQuery    = { query: string; clicks: number };
type GscPage     = { page: string; clicks: number };

export type AnalyticsChartsProps = {
  period:                  { start: string; end: string };
  checkoutStarted30d:      number;
  paidOrders30d:           number;
  checkoutToPaidConversion:number;
  revenue30d:              string;
  ordersByShipping:        ShippingItem[];
  eventsByProvider:        ProviderItem[];
  eventsByType:            EventTypeItem[];
  ga4: { status: string; summary?: GA4Summary; channels?: GA4Channel[]; pages?: GA4Page[]; error?: string };
  gsc: { status: string; summary?: GscSummary; queries?: GscQuery[];  pages?: GscPage[];  error?: string };
};

/* ─────────────────────────────────────────────
   Shared animation variants
───────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ─────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────── */
function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={item} className="relative overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-5">
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: color }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]" style={{ color }}>
        {value}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Conversion ring
───────────────────────────────────────────── */
function ConversionRing({ value }: { value: number }) {
  const r    = 48;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(value, 100);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <svg viewBox="0 0 120 120" className="w-[120px]">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f0f0" strokeWidth="7" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#8b5cf6" strokeWidth="7" strokeLinecap="butt"
          strokeDasharray={`0 ${circ}`}
          transform="rotate(-90 60 60)"
          animate={{ strokeDasharray: `${(pct / 100) * circ} ${circ}` }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        />
        <text x="60" y="57" textAnchor="middle" fontSize="15" fontWeight="200" fill="#111">
          {pct.toFixed(1)}%
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="6.5" fill="#bbb">
          CONVERSION
        </text>
      </svg>
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
        Checkout → Paiement
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Horizontal progress bar row
───────────────────────────────────────────── */
function HBar({
  label, value, max, color, index, suffix = "",
}: { label: string; value: number; max: number; color: string; index: number; suffix?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="max-w-[220px] truncate text-[11px] font-bold text-[#111]">{label}</span>
        <span className="shrink-0 text-[11px] font-bold tabular-nums" style={{ color }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-[3px] w-full bg-[#f4f4f4]">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.15 + index * 0.08, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini stat card (GA4 / GSC)
───────────────────────────────────────────── */
function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={item} className="relative overflow-hidden bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: color }} />
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-[28px] font-[100] leading-none" style={{ color }}>{value}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Section header
───────────────────────────────────────────── */
function SectionHead({ label, status, statusColor }: { label: string; status?: string; statusColor?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      {status && (
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: statusColor ?? "#aaa" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor ?? "#aaa" }} />
          {status}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Custom recharts tooltip
───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-[16px] font-[200] text-[#22c55e]">{payload[0].value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function AnalyticsCharts({
  period, checkoutStarted30d, paidOrders30d,
  checkoutToPaidConversion, revenue30d,
  ordersByShipping, eventsByProvider, eventsByType,
  ga4, gsc,
}: AnalyticsChartsProps) {

  const kpis = [
    { label: "Checkouts démarrés", value: checkoutStarted30d,                       color: "#3b82f6" },
    { label: "Commandes payées",   value: paidOrders30d,                             color: "#22c55e" },
    { label: "Taux conversion",    value: `${checkoutToPaidConversion.toFixed(1)} %`, color: "#8b5cf6" },
    { label: "CA 30 jours",        value: revenue30d,                                color: "#f97316" },
  ];

  const PALETTE = ["#22c55e", "#3b82f6", "#f97316", "#ec4899", "#8b5cf6"];

  const shippingData   = ordersByShipping.map((x) => ({ name: x.shippingMethod, value: x._count._all }));
  const maxProvider    = Math.max(0, ...eventsByProvider.map((x) => x._count._all));
  const maxEvent       = Math.max(0, ...eventsByType.map((x) => x._count._all));

  const ga4StatusColor = ga4.status === "ok" ? "#22c55e" : ga4.status === "error" ? "#ef4444" : "#aaa";
  const gscStatusColor = gsc.status === "ok" ? "#22c55e" : gsc.status === "error" ? "#ef4444" : "#aaa";

  const ga4Cards = ga4.summary ? [
    { label: "Users",    value: ga4.summary.users,     color: "#3b82f6" },
    { label: "Sessions", value: ga4.summary.sessions,  color: "#8b5cf6" },
    { label: "Vues",     value: ga4.summary.views,     color: "#ec4899" },
    { label: "Achats",   value: ga4.summary.purchases, color: "#22c55e" },
  ] : [];

  const gscCards = gsc.summary ? [
    { label: "Clics",        value: gsc.summary.clicks,                        color: "#3b82f6" },
    { label: "Impressions",  value: gsc.summary.impressions,                   color: "#8b5cf6" },
    { label: "CTR",          value: `${(gsc.summary.ctr * 100).toFixed(1)} %`, color: "#f97316" },
    { label: "Position moy", value: gsc.summary.position.toFixed(1),           color: "#22c55e" },
  ] : [];

  return (
    <div className="grid gap-12">

      {/* Period */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
      >
        Période : {period.start} — {period.end}
      </motion.p>

      {/* ── KPI cards ── */}
      <motion.div
        variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </motion.div>

      {/* ── Conversion ring + shipping bar chart ── */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45, ease: EASE }}
          className="flex items-center justify-center bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-8"
        >
          <ConversionRing value={checkoutToPaidConversion} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45, ease: EASE }}
          className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6"
        >
          <SectionHead label="Commandes par livraison" />
          {shippingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160} className="mt-6">
              <BarChart data={shippingData} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: "#aaa", fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} width={24}
                  tick={{ fontSize: 10, fill: "#aaa" }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#fafafa" }} />
                <Bar dataKey="value" isAnimationActive animationDuration={900} radius={0}>
                  {shippingData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="mt-6 text-[11px] text-slate-300">Aucune commande sur la période.</p>
          )}
        </motion.div>
      </div>

      {/* ── Events ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.45, ease: EASE }}
          className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6"
        >
          <SectionHead label="Événements par provider" />
          <div className="mt-6 grid gap-4">
            {eventsByProvider.length > 0 ? eventsByProvider.map((x, i) => (
              <HBar key={x.provider} label={x.provider} value={x._count._all}
                max={maxProvider} color={PALETTE[i % PALETTE.length]} index={i} />
            )) : <p className="text-[11px] text-slate-300">Aucun événement.</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.45, ease: EASE }}
          className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6"
        >
          <SectionHead label="Top types d'événements" />
          <div className="mt-6 grid gap-4">
            {eventsByType.length > 0 ? eventsByType.slice(0, 8).map((x, i) => (
              <HBar key={x.eventType} label={x.eventType} value={x._count._all}
                max={maxEvent} color={PALETTE[i % PALETTE.length]} index={i} />
            )) : <p className="text-[11px] text-slate-300">Aucun événement.</p>}
          </div>
        </motion.div>
      </div>

      {/* ── Google Analytics 4 ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.64, duration: 0.45, ease: EASE }}
        className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6"
      >
        <SectionHead label="Google Analytics 4" status={ga4.status} statusColor={ga4StatusColor} />

        {ga4.status === "ok" && ga4.summary && (
          <>
            <motion.div variants={container} initial="hidden" animate="visible"
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ga4Cards.map((s) => <MiniStat key={s.label} {...s} />)}
            </motion.div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {ga4.channels && ga4.channels.length > 0 && (
                <div>
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Top canaux</p>
                  <div className="grid gap-4">
                    {ga4.channels.map((c, i) => (
                      <HBar key={c.channel} label={c.channel} value={c.sessions}
                        max={Math.max(...ga4.channels!.map((x) => x.sessions))}
                        color="#3b82f6" index={i} suffix=" sess." />
                    ))}
                  </div>
                </div>
              )}
              {ga4.pages && ga4.pages.length > 0 && (
                <div>
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Top pages</p>
                  <div className="grid gap-4">
                    {ga4.pages.slice(0, 6).map((p, i) => (
                      <HBar key={p.path} label={p.path} value={p.views}
                        max={Math.max(...ga4.pages!.map((x) => x.views))}
                        color="#ec4899" index={i} suffix=" vues" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {ga4.status === "not_configured" && (
          <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
            GA4 non configuré — renseigner{" "}
            <code className="font-mono text-[10px]">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{" "}
            <code className="font-mono text-[10px]">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>{" "}
            et <code className="font-mono text-[10px]">GOOGLE_ANALYTICS_PROPERTY_ID</code>.
          </p>
        )}
        {ga4.status === "error" && (
          <p className="mt-5 text-[11px] text-[#ef4444]">{ga4.error}</p>
        )}
      </motion.div>

      {/* ── Google Search Console ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.72, duration: 0.45, ease: EASE }}
        className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6"
      >
        <SectionHead label="Google Search Console" status={gsc.status} statusColor={gscStatusColor} />

        {gsc.status === "ok" && gsc.summary && (
          <>
            <motion.div variants={container} initial="hidden" animate="visible"
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gscCards.map((s) => <MiniStat key={s.label} {...s} />)}
            </motion.div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {gsc.queries && gsc.queries.length > 0 && (
                <div>
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Top requêtes</p>
                  <div className="grid gap-4">
                    {gsc.queries.slice(0, 6).map((q, i) => (
                      <HBar key={q.query} label={q.query} value={q.clicks}
                        max={Math.max(...gsc.queries!.map((x) => x.clicks))}
                        color="#f97316" index={i} suffix=" clics" />
                    ))}
                  </div>
                </div>
              )}
              {gsc.pages && gsc.pages.length > 0 && (
                <div>
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Top pages SEO</p>
                  <div className="grid gap-4">
                    {gsc.pages.slice(0, 6).map((p, i) => (
                      <HBar key={p.page} label={p.page} value={p.clicks}
                        max={Math.max(...gsc.pages!.map((x) => x.clicks))}
                        color="#8b5cf6" index={i} suffix=" clics" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {gsc.status === "not_configured" && (
          <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
            Search Console non configuré — renseigner{" "}
            <code className="font-mono text-[10px]">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{" "}
            <code className="font-mono text-[10px]">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>{" "}
            et <code className="font-mono text-[10px]">GOOGLE_SEARCH_CONSOLE_SITE_URL</code>.
          </p>
        )}
        {gsc.status === "error" && (
          <p className="mt-5 text-[11px] text-[#ef4444]">{gsc.error}</p>
        )}
      </motion.div>
    </div>
  );
}
