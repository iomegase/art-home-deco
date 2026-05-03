import Link from "next/link";
import { getEnv } from "@/server/env";

export default async function AdminSettingsPage() {
  const env = getEnv();

  const entries = [
    ["App URL", Boolean(env.NEXT_PUBLIC_APP_URL)],
    ["Database", Boolean(env.DATABASE_URL)],
    ["Stripe", Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET)],
    ["Resend", Boolean(env.RESEND_API_KEY && env.EMAIL_FROM)],
    ["Shopcaisse", Boolean(env.SHOPCAISSE_API_KEY)],
    ["Gemini", Boolean(env.GEMINI_API_KEY)],
  ] as const;

  return (
    <section className="max-w-4xl">
      <p className="section-title text-terracotta">Configuration</p>
      <h2 className="mt-2 font-serif text-4xl">Etat du projet</h2>

      <div className="mt-8 grid gap-3 border border-line bg-surface p-6 text-sm">
        {entries.map(([label, status]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className={status ? "font-bold text-accent" : "font-bold text-terracotta"}>
              {status ? "Configure" : "Manquant"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/settings/shopcaisse" className="border border-line px-4 py-2 text-sm font-bold">
          Details Shopcaisse
        </Link>
        <Link href="/admin/orders" className="border border-line px-4 py-2 text-sm font-bold">
          Voir commandes
        </Link>
      </div>
    </section>
  );
}
