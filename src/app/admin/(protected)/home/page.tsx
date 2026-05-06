import { updateHomeContentAction, updateThemeSettingsAction, uploadHomeImageAction } from "@/features/admin-home/actions";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

function Input({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-line bg-white px-3 py-2"
        required
      />
    </label>
  );
}

function Textarea({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="w-full border border-line bg-white px-3 py-2" required />
    </label>
  );
}

function ColorInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <span className="h-8 w-8 border border-line" style={{ backgroundColor: defaultValue }} />
        <input
          name={name}
          type="text"
          defaultValue={defaultValue}
          className="w-full border border-line bg-white px-3 py-2"
          required
        />
      </div>
    </label>
  );
}

export default async function AdminHomeContentPage() {
  const { homeContent, theme } = await getSiteSettings();

  return (
    <section className="grid gap-10">
      <div>
        <p className="section-title text-terracotta">CMS Homepage</p>
        <h2 className="mt-2 font-serif text-4xl">Onglet Home</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          Tous les titres, paragraphes et photos de la page d&apos;accueil sont éditables ici.
        </p>
      </div>

      <form action={updateHomeContentAction} className="grid gap-6 border border-line bg-surface p-6">
        <h3 className="font-serif text-2xl">Contenu de la page d&apos;accueil</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Input name="heroImageUrl" label="Hero image URL" defaultValue={homeContent.heroImageUrl} />
          <Input name="heroImageAlt" label="Hero image alt" defaultValue={homeContent.heroImageAlt} />
        </div>
        <Input name="heroTitle" label="Hero titre" defaultValue={homeContent.heroTitle} />
        <Textarea name="heroParagraph" label="Hero paragraphe" defaultValue={homeContent.heroParagraph} />
        <Input name="heroCtaLabel" label="Hero bouton" defaultValue={homeContent.heroCtaLabel} />

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
        <Textarea name="adviceParagraph" label="Bloc conseil texte" defaultValue={homeContent.adviceParagraph} />

        <div className="grid gap-4 md:grid-cols-2">
          <Input name="blogCardImageUrl" label="Bloc journal image URL" defaultValue={homeContent.blogCardImageUrl} />
          <Input name="blogCardImageAlt" label="Bloc journal image alt" defaultValue={homeContent.blogCardImageAlt} />
        </div>
        <Input name="blogCardTitle" label="Bloc journal titre" defaultValue={homeContent.blogCardTitle} />
        <Textarea name="blogCardParagraph" label="Bloc journal texte" defaultValue={homeContent.blogCardParagraph} />

        <div className="grid gap-4 md:grid-cols-2">
          <Input name="approachLabel" label="Section approche label" defaultValue={homeContent.approachLabel} />
          <Input name="approachTitle" label="Section approche titre" defaultValue={homeContent.approachTitle} />
        </div>
        <Textarea name="approachParagraph" label="Section approche paragraphe" defaultValue={homeContent.approachParagraph} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="approachImageUrl" label="Section approche image URL" defaultValue={homeContent.approachImageUrl} />
          <Input name="approachImageAlt" label="Section approche image alt" defaultValue={homeContent.approachImageAlt} />
          <Input name="approachCtaLabel" label="Section approche bouton" defaultValue={homeContent.approachCtaLabel} />
        </div>

        <p className="text-sm text-muted">
          La galerie et les cartes du journal sont alimentées automatiquement depuis les produits et les articles blog publiés.
        </p>

        <Input name="newsletterTitle" label="Newsletter titre" defaultValue={homeContent.newsletterTitle} />
        <Textarea name="newsletterParagraph" label="Newsletter texte" defaultValue={homeContent.newsletterParagraph} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="newsletterPlaceholder" label="Newsletter placeholder" defaultValue={homeContent.newsletterPlaceholder} />
          <Input name="newsletterButtonLabel" label="Newsletter bouton" defaultValue={homeContent.newsletterButtonLabel} />
        </div>

        <button type="submit" className="w-fit bg-brand px-5 py-2 text-sm font-bold text-brand-contrast">
          Enregistrer le contenu Home
        </button>
      </form>

      <form action={uploadHomeImageAction} className="grid gap-4 border border-line bg-surface p-6">
        <h3 className="font-serif text-2xl">Upload photo (R2)</h3>
        <p className="text-sm text-muted">
          Upload direct d&apos;image (jpg/png/webp, max 5 MB), puis affectation automatique au champ choisi.
        </p>
        <label className="grid gap-2 text-sm">
          <span>Champ image à remplacer</span>
          <select name="target" className="border border-line bg-white px-3 py-2">
            <option value="heroImageUrl">Hero image</option>
            <option value="collectionCardImageUrl">Bloc collection image</option>
            <option value="adviceCardImageUrl">Bloc conseil image</option>
            <option value="blogCardImageUrl">Bloc journal image</option>
            <option value="approachImageUrl">Section approche image</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span>Fichier</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="border border-line bg-white px-3 py-2" required />
        </label>
        <button type="submit" className="w-fit bg-brand px-5 py-2 text-sm font-bold text-brand-contrast">
          Upload et appliquer
        </button>
      </form>

      <form action={updateThemeSettingsAction} className="grid gap-6 border border-line bg-surface p-6">
        <h3 className="font-serif text-2xl">Réglages thème</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <ColorInput name="background" label="--background" defaultValue={theme.background} />
          <ColorInput name="foreground" label="--foreground" defaultValue={theme.foreground} />
          <ColorInput name="surface" label="--surface" defaultValue={theme.surface} />
          <ColorInput name="surfaceStrong" label="--surface-strong" defaultValue={theme.surfaceStrong} />
          <ColorInput name="brand" label="--brand" defaultValue={theme.brand} />
          <ColorInput name="brandContrast" label="--brand-contrast" defaultValue={theme.brandContrast} />
          <ColorInput name="muted" label="--muted" defaultValue={theme.muted} />
          <ColorInput name="accent" label="--accent" defaultValue={theme.accent} />
          <ColorInput name="terracotta" label="--terracotta" defaultValue={theme.terracotta} />
          <ColorInput name="clay" label="--clay" defaultValue={theme.clay} />
          <ColorInput name="line" label="--line" defaultValue={theme.line} />
        </div>

        <Input name="fontDisplay" label="--font-display" defaultValue={theme.fontDisplay} />
        <Input name="fontBody" label="--font-body" defaultValue={theme.fontBody} />

        <button type="submit" className="w-fit bg-brand px-5 py-2 text-sm font-bold text-brand-contrast">
          Enregistrer le thème
        </button>
      </form>
    </section>
  );
}
