import Link from "next/link";
import { getEnv } from "@/server/env";
import { updateLegalSettingsAction, updateStoreStatusSettingsAction, updateThemeSettingsAction } from "@/features/admin-home/actions";
import { ColorInputField } from "@/components/admin/color-input-field";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold text-slate-500">{children}</span>;
}

function Input({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid">
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition focus:border-[#111]"
        required
      />
    </label>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#ececef] bg-white px-3 py-2.5">
      <span className="text-[12px] font-medium text-[#0f1115]">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[#0f1115]"
      />
    </label>
  );
}

function SectionCard({ n, title, subtitle, children }: { n: number; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)] md:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-[#f3f3f5] pb-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#fdecf4] font-mono text-[11px] font-semibold text-[#ec4899]">
          {String(n).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#0f1115]">{title}</p>
          {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function AdminSettingsPage() {
  const env = getEnv();
  const { theme, legal, storeStatus } = await getSiteSettings();

  const entries = [
    ["App URL", Boolean(env.NEXT_PUBLIC_APP_URL)],
    ["Database", Boolean(env.DATABASE_URL)],
    ["Stripe", Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET)],
    ["Resend", Boolean(env.RESEND_API_KEY && env.EMAIL_FROM)],
    ["Shopcaisse", Boolean(env.SHOPCAISSE_API_KEY)],
    ["Gemini", Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY ?? env.GEMINI_API_KEY)],
  ] as const;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 pb-10">
      <div className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)] md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Configuration</p>
        <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0f1115]">Paramètres</h1>
        <p className="mt-2 text-[12px] text-slate-500">État des services et variables globales du design system.</p>
      </div>

      <div className="grid gap-6">
        <form id="theme-form" action={updateThemeSettingsAction} className="grid gap-5">
          <SectionCard n={1} title="Thème" subtitle="Variables globales du design system">
            <div className="grid gap-4 md:grid-cols-2">
              <ColorInputField name="background" label="--background" defaultValue={theme.background} />
              <ColorInputField name="foreground" label="--foreground" defaultValue={theme.foreground} />
              <ColorInputField name="surface" label="--surface" defaultValue={theme.surface} />
              <ColorInputField name="surfaceStrong" label="--surface-strong" defaultValue={theme.surfaceStrong} />
              <ColorInputField name="brand" label="--brand" defaultValue={theme.brand} />
              <ColorInputField name="brandContrast" label="--brand-contrast" defaultValue={theme.brandContrast} />
              <ColorInputField name="muted" label="--muted" defaultValue={theme.muted} />
              <ColorInputField name="accent" label="--accent" defaultValue={theme.accent} />
              <ColorInputField name="terracotta" label="--terracotta" defaultValue={theme.terracotta} />
              <ColorInputField name="clay" label="--clay" defaultValue={theme.clay} />
              <ColorInputField name="line" label="--line" defaultValue={theme.line} />
            </div>

            <div className="mt-4 grid gap-4">
              <Input name="fontDisplay" label="--font-display" defaultValue={theme.fontDisplay} />
              <Input name="fontBody" label="--font-body" defaultValue={theme.fontBody} />
              <Input name="fontNav" label="--font-nav" defaultValue={theme.fontNav} />
            </div>
          </SectionCard>
        </form>

        <form id="legal-form" action={updateLegalSettingsAction} className="grid gap-5">
          <SectionCard n={2} title="Informations légales" subtitle="Contenu des pages légales (RGPD, CGV, mentions)">
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="commercialName" label="Nom commercial" defaultValue={legal.commercialName} />
              <Input name="legalName" label="Dénomination sociale" defaultValue={legal.legalName} />
              <Input name="legalForm" label="Forme juridique" defaultValue={legal.legalForm} />
              <Input name="capital" label="Capital social" defaultValue={legal.capital} />
              <Input name="address" label="Adresse du siège" defaultValue={legal.address} />
              <Input name="siren" label="SIREN / SIRET" defaultValue={legal.siren} />
              <Input name="rcs" label="RCS (ville)" defaultValue={legal.rcs} />
              <Input name="vat" label="TVA intracommunautaire" defaultValue={legal.vat} />
              <Input name="email" label="Email contact" defaultValue={legal.email} />
              <Input name="phone" label="Téléphone" defaultValue={legal.phone} />
              <Input name="publisher" label="Directeur de publication" defaultValue={legal.publisher} />
              <Input name="domain" label="Domaine" defaultValue={legal.domain} />
              <Input name="hostName" label="Nom hébergeur" defaultValue={legal.hostName} />
              <Input name="hostAddress" label="Adresse hébergeur" defaultValue={legal.hostAddress} />
              <Input name="hostPhone" label="Téléphone hébergeur" defaultValue={legal.hostPhone} />
              <Input name="mediatorName" label="Médiateur" defaultValue={legal.mediatorName} />
              <Input name="mediatorAddress" label="Adresse médiateur" defaultValue={legal.mediatorAddress} />
              <Input name="mediatorWebsite" label="Site médiateur" defaultValue={legal.mediatorWebsite} />
              <Input name="returnAddress" label="Adresse retour" defaultValue={legal.returnAddress} />
              <Input name="lastUpdated" label="Dernière mise à jour" defaultValue={legal.lastUpdated} />
            </div>
          </SectionCard>

        </form>

        <form id="store-status-form" action={updateStoreStatusSettingsAction} className="grid gap-5">
          <SectionCard n={3} title="Boutique physique" subtitle="Jours et horaires d'ouverture pour la popup home">
            <div className="grid gap-4">
              <Toggle
                name="whatsappEnabled"
                label="Activer WhatsApp"
                defaultChecked={storeStatus.whatsappEnabled}
              />
              <Toggle
                name="physicalStoreEnabled"
                label="Boutique physique active"
                defaultChecked={storeStatus.physicalStoreEnabled}
              />
              <Toggle
                name="showPopupWhenClosed"
                label="Afficher un popup quand la boutique est fermée"
                defaultChecked={storeStatus.showPopupWhenClosed}
              />
              <Toggle
                name="vacationModeEnabled"
                label="Mode vacances"
                defaultChecked={storeStatus.vacationModeEnabled}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input name="timezone" label="Fuseau horaire" defaultValue={storeStatus.timezone} />
              <Input name="vacationReturnDate" label="Date retour vacances" defaultValue={storeStatus.vacationReturnDate} />
              <Input name="morningOpenTime" label="Ouverture matin" defaultValue={storeStatus.morningOpenTime} />
              <Input name="morningCloseTime" label="Fermeture matin" defaultValue={storeStatus.morningCloseTime} />
              <Input name="afternoonOpenTime" label="Ouverture après-midi" defaultValue={storeStatus.afternoonOpenTime} />
              <Input name="afternoonCloseTime" label="Fermeture après-midi" defaultValue={storeStatus.afternoonCloseTime} />
            </div>

            <div className="mt-4">
              <FieldLabel>Jours d&apos;ouverture</FieldLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {[
                  ["mon", "Lundi"],
                  ["tue", "Mardi"],
                  ["wed", "Mercredi"],
                  ["thu", "Jeudi"],
                  ["fri", "Vendredi"],
                  ["sat", "Samedi"],
                  ["sun", "Dimanche"],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 rounded-xl border border-[#ececef] bg-white px-3 py-2 text-[12px] text-[#0f1115]">
                    <input
                      type="checkbox"
                      name="openDays"
                      value={value}
                      defaultChecked={storeStatus.openDays.includes(value as "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")}
                      className="h-4 w-4 accent-[#0f1115]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input name="closedMessage" label="Message fermeture" defaultValue={storeStatus.closedMessage} />
              <Input name="vacationMessage" label="Message vacances" defaultValue={storeStatus.vacationMessage} />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-[#f97316] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#ea580c]"
              >
                Enregistrer horaires boutique
              </button>
            </div>
          </SectionCard>
        </form>

        <div className="fixed bottom-3 left-3 right-3 z-30 rounded-2xl bg-[#0f1115] px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(15,17,21,0.18)] md:left-[calc(292px+2rem)] md:right-8 xl:right-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-[12px]">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              Modifications
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button type="submit" form="theme-form" className="rounded-lg bg-[#f97316] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#ea580c]">
                Enregistrer le thème
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <SectionCard n={4} title="État du projet" subtitle="Vérification de configuration">
            <div className="grid gap-2">
              {entries.map(([label, status]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2.5">
                  <span className="text-[12px] text-[#0f1115]">{label}</span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={status ? { color: "#10b981", backgroundColor: "#e9faf2" } : { color: "#ef4444", backgroundColor: "#fdecec" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status ? "#10b981" : "#ef4444" }} />
                    {status ? "Configuré" : "Manquant"}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard n={5} title="Raccourcis" subtitle="Navigation rapide">
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/settings/shopcaisse" className="rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#0f1115] hover:border-[#0f1115]">
                Détails Shopcaisse
              </Link>
              <Link href="/admin/orders" className="rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#0f1115] hover:border-[#0f1115]">
                Voir commandes
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
