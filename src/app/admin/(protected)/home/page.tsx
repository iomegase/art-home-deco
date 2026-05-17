import { updateHomeContentAction, uploadHomeImageAction } from "@/features/admin-home/actions";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition placeholder:text-slate-300 focus:border-[#111]";
const textareaClass =
  "mt-2 w-full resize-y rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition placeholder:text-slate-300 focus:border-[#111]";
const selectClass =
  "mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition focus:border-[#111]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold text-slate-500">{children}</span>;
}

function Input({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid">
      <FieldLabel>{label}</FieldLabel>
      <input name={name} type={type} defaultValue={defaultValue} className={inputClass} required />
    </label>
  );
}

function Textarea({ name, label, defaultValue, rows = 3 }: { name: string; label: string; defaultValue: string; rows?: number }) {
  return (
    <label className="grid">
      <FieldLabel>{label}</FieldLabel>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className={textareaClass} required />
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

export default async function AdminHomeContentPage() {
  const { homeContent } = await getSiteSettings();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 pb-10">
      <div className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)] md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">CMS Homepage</p>
        <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0f1115]">Onglet Home</h1>
        <p className="mt-2 max-w-3xl text-[12px] text-slate-500">
          Tous les titres, paragraphes et visuels de la page d&apos;accueil sont éditables ici.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form id="home-content-form" action={updateHomeContentAction} className="grid gap-5">
          <SectionCard n={1} title="Hero" subtitle="Zone d&apos;accroche principale">
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="heroImageUrl" label="Hero image URL" defaultValue={homeContent.heroImageUrl} />
                <Input name="heroImageAlt" label="Hero image alt" defaultValue={homeContent.heroImageAlt} />
              </div>
              <Input name="heroTitle" label="Hero titre" defaultValue={homeContent.heroTitle} />
              <Textarea name="heroParagraph" label="Hero paragraphe" defaultValue={homeContent.heroParagraph} rows={4} />
              <Input name="heroCtaLabel" label="Hero bouton" defaultValue={homeContent.heroCtaLabel} />
            </div>
          </SectionCard>

          <SectionCard n={2} title="Blocs éditoriaux" subtitle="Collection, conseil et journal">
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="collectionCardImageUrl" label="Bloc collection image URL" defaultValue={homeContent.collectionCardImageUrl} />
                <Input name="collectionCardImageAlt" label="Bloc collection image alt" defaultValue={homeContent.collectionCardImageAlt} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="collectionTitle" label="Bloc collection titre" defaultValue={homeContent.collectionTitle} />
                <Input name="adviceTitle" label="Bloc conseil titre" defaultValue={homeContent.adviceTitle} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="adviceCardImageUrl" label="Bloc conseil image URL" defaultValue={homeContent.adviceCardImageUrl} />
                <Input name="adviceCardImageAlt" label="Bloc conseil image alt" defaultValue={homeContent.adviceCardImageAlt} />
              </div>
              <Textarea name="adviceParagraph" label="Bloc conseil texte" defaultValue={homeContent.adviceParagraph} rows={4} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="blogCardImageUrl" label="Bloc journal image URL" defaultValue={homeContent.blogCardImageUrl} />
                <Input name="blogCardImageAlt" label="Bloc journal image alt" defaultValue={homeContent.blogCardImageAlt} />
              </div>
              <Input name="blogCardTitle" label="Bloc journal titre" defaultValue={homeContent.blogCardTitle} />
              <Textarea name="blogCardParagraph" label="Bloc journal texte" defaultValue={homeContent.blogCardParagraph} rows={4} />
            </div>
          </SectionCard>

          <SectionCard n={3} title="Section approche" subtitle="Message de marque et CTA">
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="approachLabel" label="Section approche label" defaultValue={homeContent.approachLabel} />
                <Input name="approachTitle" label="Section approche titre" defaultValue={homeContent.approachTitle} />
              </div>
              <Textarea name="approachParagraph" label="Section approche paragraphe" defaultValue={homeContent.approachParagraph} rows={4} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input name="approachImageUrl" label="Section approche image URL" defaultValue={homeContent.approachImageUrl} />
                <Input name="approachImageAlt" label="Section approche image alt" defaultValue={homeContent.approachImageAlt} />
                <Input name="approachCtaLabel" label="Section approche bouton" defaultValue={homeContent.approachCtaLabel} />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={4} title="Engagements" subtitle="Titre + 6 cartes engagements">
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="commitmentsLabel" label="Section engagements label" defaultValue={homeContent.commitmentsLabel} />
                <Input name="commitmentsTitle" label="Section engagements titre" defaultValue={homeContent.commitmentsTitle} />
              </div>
              <Textarea
                name="commitmentsParagraph"
                label="Section engagements paragraphe"
                defaultValue={homeContent.commitmentsParagraph}
                rows={3}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="commitmentOneTitle" label="Engagement 1 titre" defaultValue={homeContent.commitmentOneTitle} />
                <Input name="commitmentTwoTitle" label="Engagement 2 titre" defaultValue={homeContent.commitmentTwoTitle} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Textarea name="commitmentOneText" label="Engagement 1 texte" defaultValue={homeContent.commitmentOneText} rows={3} />
                <Textarea name="commitmentTwoText" label="Engagement 2 texte" defaultValue={homeContent.commitmentTwoText} rows={3} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="commitmentThreeTitle" label="Engagement 3 titre" defaultValue={homeContent.commitmentThreeTitle} />
                <Input name="commitmentFourTitle" label="Engagement 4 titre" defaultValue={homeContent.commitmentFourTitle} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Textarea name="commitmentThreeText" label="Engagement 3 texte" defaultValue={homeContent.commitmentThreeText} rows={3} />
                <Textarea name="commitmentFourText" label="Engagement 4 texte" defaultValue={homeContent.commitmentFourText} rows={3} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="commitmentFiveTitle" label="Engagement 5 titre" defaultValue={homeContent.commitmentFiveTitle} />
                <Input name="commitmentSixTitle" label="Engagement 6 titre" defaultValue={homeContent.commitmentSixTitle} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Textarea name="commitmentFiveText" label="Engagement 5 texte" defaultValue={homeContent.commitmentFiveText} rows={3} />
                <Textarea name="commitmentSixText" label="Engagement 6 texte" defaultValue={homeContent.commitmentSixText} rows={3} />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={5} title="Newsletter" subtitle="Bloc de capture email">
            <div className="grid gap-4">
              <Input name="newsletterTitle" label="Newsletter titre" defaultValue={homeContent.newsletterTitle} />
              <Textarea name="newsletterParagraph" label="Newsletter texte" defaultValue={homeContent.newsletterParagraph} rows={4} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="newsletterPlaceholder" label="Newsletter placeholder" defaultValue={homeContent.newsletterPlaceholder} />
                <Input name="newsletterButtonLabel" label="Newsletter bouton" defaultValue={homeContent.newsletterButtonLabel} />
              </div>
            </div>
          </SectionCard>

          <div className="rounded-xl border border-[#e9faf2] bg-[#f0fdf4] px-4 py-3 text-[12px] text-[#047857]">
            La galerie et les cartes du journal sont alimentées automatiquement depuis les produits et les articles publiés.
          </div>

          <div className="fixed bottom-3 left-3 right-3 z-30 rounded-2xl bg-[#0f1115] px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(15,17,21,0.18)] md:left-[calc(292px+2rem)] md:right-8 xl:right-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                Modifications du contenu Home
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="reset"
                  form="home-content-form"
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-white/20"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="home-content-form"
                  className="rounded-lg bg-[#f97316] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#ea580c]"
                >
                  Enregistrer le contenu Home
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className="self-start lg:sticky lg:top-6">
          <div className="grid gap-5">
            <SectionCard n={6} title="Upload image" subtitle="Upload direct vers R2 + affectation champ">
              <form action={uploadHomeImageAction} className="grid gap-4">
                <label className="grid">
                  <FieldLabel>Champ image à remplacer</FieldLabel>
                  <select name="target" className={selectClass}>
                    <option value="heroImageUrl">Hero image</option>
                    <option value="collectionCardImageUrl">Bloc collection image</option>
                    <option value="adviceCardImageUrl">Bloc conseil image</option>
                    <option value="blogCardImageUrl">Bloc journal image</option>
                    <option value="approachImageUrl">Section approche image</option>
                  </select>
                </label>

                <label className="grid">
                  <FieldLabel>Fichier</FieldLabel>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[12px] text-[#0f1115]"
                    required
                  />
                </label>

                <button type="submit" className="rounded-xl bg-[#f97316] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#ea580c]">
                  Upload et appliquer
                </button>
              </form>
            </SectionCard>

          </div>
        </aside>
      </div>
    </div>
  );
}
