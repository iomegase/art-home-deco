import { generateAiBlogDraftAction } from "@/features/ai/actions";

type AdminNewBlogPostPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminNewBlogPostPage({ searchParams }: AdminNewBlogPostPageProps) {
  const query = searchParams ? await searchParams : undefined;

  return (
    <section className="max-w-3xl">
      <p className="section-title text-terracotta">Blog SEO IA</p>
      <h2 className="mt-2 font-serif text-4xl">Nouveau brouillon</h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        L&apos;IA prepare un brouillon complet (titre, extrait, contenu, SEO). La publication doit rester
        manuelle apres relecture humaine.
      </p>

      {query?.error ? <div className="mt-6 border border-line bg-surface p-4 text-sm">{query.error}</div> : null}

      <form action={generateAiBlogDraftAction} className="mt-8 grid gap-5 border border-line bg-surface p-6">
        <label className="text-sm font-bold">
          Prompt
          <input name="topic" required className="mt-2 w-full border border-line bg-background px-3 py-3" />
          <span className="mt-2 block text-xs font-normal text-muted">
            Le prompt contient la demande complete a respecter par Gemini.
          </span>
        </label>
        <label className="text-sm font-bold">
          Intention
          <select name="intent" className="mt-2 w-full border border-line bg-background px-3 py-3">
            <option value="guide_achat">Guide achat</option>
            <option value="conseil_deco">Conseil deco</option>
            <option value="idee_cadeau">Idee cadeau</option>
            <option value="tendance">Tendance</option>
          </select>
          <span className="mt-2 block text-xs font-normal text-muted">
            L&apos;intention donne la direction editoriale du brouillon.
          </span>
        </label>
        <label className="text-sm font-bold">
          Points a developper
          <input name="targetKeyword" required className="mt-2 w-full border border-line bg-background px-3 py-3" />
          <span className="mt-2 block text-xs font-normal text-muted">
            Saisir une liste de points importants a traiter, par exemple `decoration, tendance, paris`.
          </span>
        </label>
        <label className="text-sm font-bold">
          Lien produit boutique (optionnel)
          <input
            name="boutiqueProductLink"
            placeholder="/boutique/mon-produit"
            className="mt-2 w-full border border-line bg-background px-3 py-3"
          />
          <span className="mt-2 block text-xs font-normal text-muted">
            Si vide, le CTA utilisera `/boutique` avec le libelle &quot;Explorez notre boutique&quot;.
          </span>
        </label>
        <label className="flex items-center gap-3 text-sm font-bold">
          <input type="checkbox" name="includeBlogContext" defaultChecked />
          <span>Inclure contexte Art Home Déco</span>
        </label>
        <button type="submit" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Generer un brouillon
        </button>
      </form>
    </section>
  );
}
