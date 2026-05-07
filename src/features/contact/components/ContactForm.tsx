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

const inputClassName =
  "w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-base text-foreground outline-none transition placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-0";

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
    <label className="grid gap-2 text-sm text-foreground">
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/55">
        {label}
        {required ? <span className="ml-1 text-terracotta">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-medium text-terracotta">{error}</span> : null}
    </label>
  );
}

function ProfileSummary({ type }: { type: ContactFormState["type"] }) {
  const selectedProfile = contactProfileOptions.find((option) => option.value === type);

  return (
    <div className="border-t border-black/10 pt-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">Profil selectionne</p>
      <p className="mt-3 font-serif text-2xl leading-tight text-black">{selectedProfile?.title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-black/60">{selectedProfile?.description}</p>
    </div>
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

  function getFieldError(key: ContactFormField) {
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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <section className="bg-[#e7e7e7] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
        

        <div className="grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <div className="grid content-start gap-8">
            <div>
              {/* <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-terracotta">Studio relation</p> */}
              <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] text-black md:text-7xl">
                Parlons de votre projet
              </h1>
              {/* <p className="mt-6 max-w-lg text-base leading-8 text-black/62">
                Demande client, sourcing fournisseur, collaboration createur ou message libre: le
                formulaire garde le meme traitement metier et ajuste simplement les informations utiles
                selon votre profil.
              </p> */}
            </div>

            <div className="grid gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">Vous etes</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {contactProfileOptions.map((option) => {
                  const active = form.type === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => clearConditionalFields(option.value)}
                      className={
                        active
                          ? "grid gap-2 rounded-[1.25rem] bg-black px-5 py-4 text-left text-white"
                          : "grid gap-2 rounded-[1.25rem] border border-black/10 bg-white px-5 py-4 text-left text-black transition hover:border-black"
                      }
                    >
                      <span className="text-lg font-bold">{option.title}</span>
                      <span className={active ? "text-sm leading-6 text-white/75" : "text-sm leading-6 text-black/55"}>
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ProfileSummary type={form.type} />

            {/* <div className="grid gap-6 border-t border-black/10 pt-6 text-sm text-black/58 md:grid-cols-3">
              <div>
                <p className="font-bold uppercase tracking-[0.18em] text-black">Cible claire</p>
                <p className="mt-3 leading-6">Le formulaire change selon le profil sans perdre la validation existante.</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-[0.18em] text-black">Canal direct</p>
                <p className="mt-3 leading-6">La reponse email revient directement vers votre adresse via Reply-To.</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-[0.18em] text-black">Anti-spam</p>
                <p className="mt-3 leading-6">Honeypot invisible, validation Zod et envoi serveur seulement.</p>
              </div>
            </div> */}

            {/* <div className="border-t border-black/10 pt-6 text-sm text-black/55">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">Email</p>
                  <p className="mt-2 text-base text-black">bonjour@arthomedeco.fr</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">Traitement</p>
                  <p className="mt-2 text-base text-black">Resend cote serveur, sans exposition de cle.</p>
                </div>
              </div>
            </div> */}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8 border-t border-black/10 pt-2 lg:border-l lg:border-t-0 lg:pl-10">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Prenom" required error={getFieldError("firstName")}>
                <input
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  className={inputClassName}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Nom" required error={getFieldError("lastName")}>
                <input
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  className={inputClassName}
                  autoComplete="family-name"
                />
              </Field>
              <Field label="Email" required error={getFieldError("email")}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className={inputClassName}
                  autoComplete="email"
                />
              </Field>
              <Field label="Telephone" error={getFieldError("phone")}>
                <input
                  type="tel"
                  value={form.phone ?? ""}
                  onChange={(event) => update("phone", event.target.value)}
                  className={inputClassName}
                  autoComplete="tel"
                />
              </Field>
            </div>

            {form.type === "client" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Sujet de la demande" required error={getFieldError("clientSubject")}>
                  <input
                    value={form.clientSubject ?? ""}
                    onChange={(event) => update("clientSubject", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Numero de commande" error={getFieldError("orderNumber")}>
                  <input
                    value={form.orderNumber ?? ""}
                    onChange={(event) => update("orderNumber", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            ) : null}

            {form.type === "supplier" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nom de l'entreprise" required error={getFieldError("companyName")}>
                  <input
                    value={form.companyName ?? ""}
                    onChange={(event) => update("companyName", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Site web" required error={getFieldError("website")}>
                  <input
                    type="url"
                    value={form.website ?? ""}
                    onChange={(event) => update("website", event.target.value)}
                    className={inputClassName}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Categorie de produits" required error={getFieldError("productCategory")}>
                  <input
                    value={form.productCategory ?? ""}
                    onChange={(event) => update("productCategory", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="SIRET" error={getFieldError("siret")}>
                  <input
                    value={form.siret ?? ""}
                    onChange={(event) => update("siret", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            ) : null}

            {form.type === "creator" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nom de marque / atelier" required error={getFieldError("brandName")}>
                  <input
                    value={form.brandName ?? ""}
                    onChange={(event) => update("brandName", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Localisation" required error={getFieldError("location")}>
                  <input
                    value={form.location ?? ""}
                    onChange={(event) => update("location", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Univers produit" required error={getFieldError("productUniverse")}>
                  <input
                    value={form.productUniverse ?? ""}
                    onChange={(event) => update("productUniverse", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Site web ou Instagram" required error={getFieldError("websiteOrInstagram")}>
                  <input
                    value={form.websiteOrInstagram ?? ""}
                    onChange={(event) => update("websiteOrInstagram", event.target.value)}
                    className={inputClassName}
                    placeholder="https://... ou @instagram"
                  />
                </Field>
                <Field
                  label="Type de collaboration souhaite"
                  required
                  error={getFieldError("collaborationType")}
                >
                  <input
                    value={form.collaborationType ?? ""}
                    onChange={(event) => update("collaborationType", event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            ) : null}

            <Field label="Message" required error={getFieldError("message")}>
              <textarea
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                rows={7}
                className={`${inputClassName} min-h-[12rem] resize-y`}
                placeholder="Decrivez votre besoin, votre univers ou votre demande."
              />
            </Field>

            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-company">
                Laisser vide
                <input
                  id="contact-company"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honeypot}
                  onChange={(event) => update("honeypot", event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-4 border-t border-black/10 pt-6 text-sm text-black/65">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => update("consent", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-black/30 text-black"
                />
                <span>
                  J&apos;accepte que mes donnees soient utilisees pour traiter ma demande de contact.
                  <span className="ml-1 text-terracotta">*</span>
                </span>
              </label>
              {getFieldError("consent") ? <p className="text-xs text-terracotta">{getFieldError("consent")}</p> : null}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.whatsappOptIn}
                  onChange={(event) => update("whatsappOptIn", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-black/30 text-black"
                />
                <span>Je souhaite pouvoir etre recontacte(e) via WhatsApp si cela facilite l&apos;echange.</span>
              </label>
            </div>

            {serverMessage ? (
              <div
                className={
                  success
                    ? "border border-black/10 bg-black/[0.03] px-5 py-4 text-sm text-accent"
                    : "border border-black/10 bg-black/[0.03] px-5 py-4 text-sm text-terracotta"
                }
              >
                {serverMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-black/10 pt-6 ">
              <p className="max-w-sm text-xs leading-6 text-black/45">
                Ce formulaire ne publie aucune donnee cote client et n&apos;utilise la cle Resend que sur
                le serveur.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
