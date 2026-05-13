"use client";

import { useState } from "react";
import {
  contactProfileOptions,
  contactRequestSchema,
  type ContactApiResponse,
} from "@/features/contact/schemas/contact.schema";
import { trackContactFormSubmit } from "@/lib/analytics/events";

type ContactFormState = {
  type: "client" | "supplier" | "creator" | "general";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  whatsappOptIn: boolean;
  honeypot: string;
  clientSubject: string;
  orderNumber: string;
  companyName: string;
  website: string;
  productCategory: string;
  siret: string;
  brandName: string;
  location: string;
  productUniverse: string;
  websiteOrInstagram: string;
  collaborationType: string;
};
type ContactFormField = keyof ContactFormState;

const inputClass =
  "w-full border-0 border-b border-[#e5e7eb] bg-transparent pb-2 pt-1 text-[14px] text-[#171717] outline-none transition placeholder:text-[#d1d5db] focus:border-[#171717]";

const initialState: ContactFormState = {
  type: "client",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
  whatsappOptIn: false,
  honeypot: "",
  clientSubject: "",
  orderNumber: "",
  companyName: "",
  website: "",
  productCategory: "",
  siret: "",
  brandName: "",
  location: "",
  productUniverse: "",
  websiteOrInstagram: "",
  collaborationType: "",
};

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
        {label}
        {required && <span className="ml-1 text-[#bd6745]">*</span>}
      </span>
      {children}
      {error && (
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#bd6745]">
          {error}
        </span>
      )}
    </label>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends ContactFormField>(key: K, value: ContactFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function getError(key: ContactFormField) {
    return fieldErrors[key]?.[0];
  }

  function clearConditionalFields(nextType: ContactFormState["type"]) {
    setForm((current) => ({
      ...current,
      type: nextType,
      clientSubject: nextType === "client" ? current.clientSubject : "",
      orderNumber: nextType === "client" ? current.orderNumber : "",
      companyName: nextType === "supplier" ? current.companyName : "",
      website: nextType === "supplier" ? current.website : "",
      productCategory: nextType === "supplier" ? current.productCategory : "",
      siret: nextType === "supplier" ? current.siret : "",
      brandName: nextType === "creator" ? current.brandName : "",
      location: nextType === "creator" ? current.location : "",
      productUniverse: nextType === "creator" ? current.productUniverse : "",
      websiteOrInstagram: nextType === "creator" ? current.websiteOrInstagram : "",
      collaborationType: nextType === "creator" ? current.collaborationType : "",
    }));
    setFieldErrors({});
    setServerMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setServerMessage(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = contactRequestSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as ContactApiResponse;

      if (!payload.success) {
        setServerMessage(payload.message);
        setFieldErrors(payload.fieldErrors ?? {});
        setLoading(false);
        return;
      }

      trackContactFormSubmit();
      setSuccess(true);
      setServerMessage(payload.message);
      setForm(initialState);
    } catch {
      setServerMessage("Impossible d'envoyer votre message pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Succès ── */
  if (success && serverMessage) {
    return (
      <div className="border-t border-[#e5e7eb] py-32 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Message envoyé
        </p>
        <h2 className="mt-6 text-[40px] font-[300] leading-tight tracking-[-0.03em] text-[#171717] md:text-[56px]">
          Merci pour votre message.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[12px] font-bold uppercase leading-6 tracking-[0.1em] text-slate-500">
          {serverMessage}
        </p>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <div className="grid border-t border-[#e5e7eb] pt-12 lg:grid-cols-[360px_1fr] lg:gap-24">

      {/* ── Colonne gauche : sélecteur de profil ── */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Vous êtes
        </p>

        <div className="flex flex-col">
          {contactProfileOptions.map((option) => {
            const active = form.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => clearConditionalFields(option.value)}
                className={`w-full border-b border-[#e5e7eb] py-5 text-left transition ${
                  active ? "text-[#171717]" : "text-[#b0a99a] hover:text-[#171717]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold uppercase tracking-[0.14em]">
                    {option.title}
                  </span>
                  {active && (
                    <span className="text-[22px] font-extralight">→</span>
                  )}
                </div>
                {active && (
                  <p className="mt-2 max-w-[280px] text-[12px] font-bold uppercase leading-5 tracking-[0.08em] text-slate-500">
                    {option.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Colonne droite : champs ── */}
      <form onSubmit={handleSubmit} className="mt-12 grid gap-8 lg:mt-0">

        {/* Identité */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Prénom" required error={getError("firstName")}>
            <input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={inputClass}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Nom" required error={getError("lastName")}>
            <input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={inputClass}
              autoComplete="family-name"
            />
          </Field>
          <Field label="Email" required error={getError("email")}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </Field>
          <Field label="Téléphone" error={getError("phone")}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              autoComplete="tel"
            />
          </Field>
        </div>

        {/* Champs conditionnels — Client */}
        {form.type === "client" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Sujet de la demande" required error={getError("clientSubject")}>
              <input
                value={form.clientSubject}
                onChange={(e) => update("clientSubject", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Numéro de commande" error={getError("orderNumber")}>
              <input
                value={form.orderNumber}
                onChange={(e) => update("orderNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Champs conditionnels — Fournisseur */}
        {form.type === "supplier" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Nom de l'entreprise" required error={getError("companyName")}>
              <input
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Site web" required error={getError("website")}>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>
            <Field label="Catégorie de produits" required error={getError("productCategory")}>
              <input
                value={form.productCategory}
                onChange={(e) => update("productCategory", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="SIRET" error={getError("siret")}>
              <input
                value={form.siret}
                onChange={(e) => update("siret", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Champs conditionnels — Créateur */}
        {form.type === "creator" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Nom de marque / atelier" required error={getError("brandName")}>
              <input
                value={form.brandName}
                onChange={(e) => update("brandName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Localisation" required error={getError("location")}>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Univers produit" required error={getError("productUniverse")}>
              <input
                value={form.productUniverse}
                onChange={(e) => update("productUniverse", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Site web ou Instagram" required error={getError("websiteOrInstagram")}>
              <input
                value={form.websiteOrInstagram}
                onChange={(e) => update("websiteOrInstagram", e.target.value)}
                className={inputClass}
                placeholder="https://... ou @instagram"
              />
            </Field>
            <Field
              label="Type de collaboration souhaité"
              required
              error={getError("collaborationType")}
            >
              <input
                value={form.collaborationType}
                onChange={(e) => update("collaborationType", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Message */}
        <Field label="Message" required error={getError("message")}>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            rows={6}
            className={`${inputClass} min-h-[10rem] resize-y`}
            placeholder="Décrivez votre besoin, votre univers ou votre demande…"
          />
        </Field>

        {/* Honeypot */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="contact-company">
            Laisser vide
            <input
              id="contact-company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={form.honeypot}
              onChange={(e) => update("honeypot", e.target.value)}
            />
          </label>
        </div>

        {/* Consentements */}
        <div className="grid gap-4 border-t border-[#e5e7eb] pt-6">
          <label className="flex items-start gap-3 text-[12px] leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#171717]"
            />
            <span>
              J&apos;accepte que mes données soient utilisées pour traiter ma demande de contact.
              <span className="ml-1 text-[#bd6745]">*</span>
            </span>
          </label>
          {getError("consent") && (
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#bd6745]">
              {getError("consent")}
            </p>
          )}

          <label className="flex items-start gap-3 text-[12px] leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={form.whatsappOptIn}
              onChange={(e) => update("whatsappOptIn", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#171717]"
            />
            <span>
              Je souhaite pouvoir être recontacté(e) via WhatsApp si cela facilite l&apos;échange.
            </span>
          </label>
        </div>

        {/* Message serveur erreur */}
        {serverMessage && !success && (
          <div className="border-l-2 border-[#bd6745] pl-4 text-[12px] font-bold uppercase leading-6 tracking-[0.08em] text-[#bd6745]">
            {serverMessage}
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-6">
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#b0a99a]">
            Formulaire sécurisé — aucune donnée exposée côté client.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="h-[52px] w-full bg-[#171717] text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#747b4f] disabled:cursor-not-allowed disabled:bg-[#b0a99a]"
          >
            {loading ? "Envoi en cours…" : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </div>
  );
}