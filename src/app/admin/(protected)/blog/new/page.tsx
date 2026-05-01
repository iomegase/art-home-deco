import { generateAiBlogDraftAction } from "@/features/ai/actions";

export default function AdminNewBlogPostPage() {
  return (
    <section className="max-w-3xl">
      <p className="section-title text-terracotta">Blog SEO IA</p>
      <h2 className="mt-2 font-serif text-4xl">Nouveau brouillon</h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        L&apos;IA sert uniquement a preparer un brouillon: titre, meta description et plan. La publication
        doit rester manuelle apres relecture humaine.
      </p>

      <form action={generateAiBlogDraftAction} className="mt-8 grid gap-5 border border-line bg-surface p-6">
        <label className="text-sm font-bold">
          Sujet
          <input name="topic" required className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>
        <label className="text-sm font-bold">
          Intention
          <select name="intent" className="mt-2 w-full border border-line bg-background px-3 py-3">
            <option value="guide_achat">Guide achat</option>
            <option value="conseil_deco">Conseil deco</option>
            <option value="idee_cadeau">Idee cadeau</option>
            <option value="tendance">Tendance</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Mot-cle cible
          <input name="targetKeyword" required className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>
        <button type="submit" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
          Generer un brouillon
        </button>
      </form>
    </section>
  );
}
