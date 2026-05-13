"use client";

import { motion } from "framer-motion";

type ConfigItem = { label: string; isSet: boolean };

type Props = {
  configItems: ConfigItem[];
  totals: {
    events: number;
    success: number;
    error: number;
    pending: number;
  };
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Kpi({ label, value, tone }: { label: string; value: string | number; tone: "blue" | "green" | "orange" | "violet" }) {
  const styles = {
    blue: { border: "#3b82f6", color: "#3b82f6" },
    green: { border: "#22c55e", color: "#22c55e" },
    orange: { border: "#f97316", color: "#f97316" },
    violet: { border: "#8b5cf6", color: "#8b5cf6" },
  }[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative overflow-hidden bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
      style={{ borderColor: styles.border }}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: styles.color }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]" style={{ color: styles.color }}>
        {value}
      </p>
    </motion.article>
  );
}

export function ShopcaisseSettingsDashboard({ configItems, totals }: Props) {
  const configuredCount = configItems.filter((item) => item.isSet).length;
  const coverage = configItems.length === 0 ? 0 : Math.round((configuredCount / configItems.length) * 100);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Config prête" value={`${coverage}%`} tone="blue" />
        <Kpi label="Événements" value={totals.events} tone="violet" />
        <Kpi label="Succès" value={totals.success} tone="green" />
        <Kpi label="En attente" value={totals.pending} tone="orange" />
        <Kpi label="Erreurs" value={totals.error} tone="orange" />
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="relative overflow-hidden bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
        >
          <span className="absolute inset-y-0 left-0 w-[3px] bg-[#3b82f6]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Configuration API</p>
          <p className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em] text-[#111]">
            {configuredCount}/{configItems.length}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              Configuré
            </span>
            <span className="text-[12px] text-slate-500">champs API disponibles</span>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
