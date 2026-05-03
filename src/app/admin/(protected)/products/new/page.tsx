import Link from "next/link";
import { importProductsCsvAction } from "@/features/product/actions";
import { productImportReportFilterSchema } from "@/schemas/forms/product-import-report.schema";
import { findIntegrationEventById, listRecentIntegrationEvents } from "@/server/repositories/integration.repository";

type AdminNewProductPageProps = {
  searchParams?: Promise<{
    eventId?: string;
    status?: string;
    actorEmail?: string;
    batchLabel?: string;
  }>;
};

const csvExample = `title,sku,priceCents,stock,category,shippingClass,barcode,externalStockId,imageUrl
Vase Brut Atelier,VASE-BRUT-001,6900,8,ceramiques,M,376000000001,SC-1001,https://images.unsplash.com/photo-1517705008128-361805f42e86
Plaid Sable Tisse,PLAID-SABLE-001,12900,4,textiles,L,376000000002,SC-1002,https://images.unsplash.com/photo-1512436991641-6745cdb1723f`;

export default async function AdminNewProductPage({ searchParams }: AdminNewProductPageProps) {
  const rawQuery = searchParams ? await searchParams : undefined;
  const query = productImportReportFilterSchema.parse(rawQuery ?? {});
  const [currentEvent, recentEvents] = await Promise.all([
    query?.eventId ? findIntegrationEventById(query.eventId) : null,
    listRecentIntegrationEvents("catalog", "product_csv_import", {
      status: query.status || undefined,
      actorEmail: query.actorEmail || undefined,
      batchLabel: query.batchLabel || undefined,
    }),
  ]);
  const currentPayload = currentEvent?.payloadJson ? (JSON.parse(currentEvent.payloadJson) as {
    totalRows?: number;
    created?: number;
    updated?: number;
    errors?: Array<{ rowNumber: number; message: string; sku?: string; title?: string }>;
    batchLabel?: string | null;
    actorEmail?: string | null;
    sourceFileName?: string | null;
  }) : null;

  return (
    <section className="max-w-4xl">
      <p className="section-title text-terracotta">Catalogue</p>
      <h2 className="mt-2 font-serif text-4xl">Import et creation assistee</h2>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
        Ce lot sert a accelerer la creation de nombreuses references. Le CSV cree ou met a jour les produits
        par SKU, barcode, externalStockId ou slug. Les brouillons IA restent en statut `draft` jusqu&apos;a
        validation humaine.
      </p>

      {currentEvent && currentPayload ? (
        <div className="mt-6 border border-line bg-surface p-4 text-sm">
          <p>
            Import termine: {currentPayload.created ?? "0"} crees, {currentPayload.updated ?? "0"} mis a jour,{" "}
            {currentPayload.errors?.length ?? 0} erreur(s) sur {currentPayload.totalRows ?? 0} ligne(s).
          </p>
          {currentPayload.errors?.length ? (
            <div className="mt-3 grid gap-2 text-muted">
              {currentPayload.errors.slice(0, 5).map((error) => (
                <p key={`${error.rowNumber}-${error.sku ?? error.title ?? error.message}`}>
                  Ligne {error.rowNumber}: {error.message}
                </p>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {currentPayload.errors?.length ? (
              <Link
                href={`/api/admin/products/import-errors?eventId=${currentEvent.id}`}
                className="border border-line px-4 py-2 text-sm font-bold"
              >
                Telecharger les erreurs CSV
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form action={importProductsCsvAction} className="grid gap-5 border border-line bg-surface p-6">
          <div>
            <h3 className="font-serif text-2xl">Import CSV</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Colonnes supportees: `title`, `slug`, `sku`, `barcode`, `externalStockId`, `priceCents`, `stock`,
              `category` ou `categories`, `shippingClass`, `pickupOnly`, `estimatedWeightGrams`, `isFragile`,
              `imageUrl`, `imageAlt`, `seoTitle`, `seoDescription`.
            </p>
            <div className="mt-4">
              <Link href="/api/admin/products/import-template" className="border border-line px-4 py-2 text-sm font-bold">
                Telecharger le modele CSV
              </Link>
            </div>
          </div>

          <label className="text-sm font-bold">
            Nom du lot
            <input
              name="batchLabel"
              placeholder="ex: arrivage mai 2026"
              className="mt-2 block w-full border border-line bg-background px-3 py-3"
            />
          </label>

          <label className="text-sm font-bold">
            Fichier CSV
            <input
              type="file"
              name="csvFile"
              accept=".csv,text/csv"
              className="mt-2 block w-full border border-line bg-background px-3 py-3"
            />
          </label>

          <label className="text-sm font-bold">
            Ou colle le CSV
            <textarea
              name="csvContent"
              rows={12}
              defaultValue={csvExample}
              className="mt-2 w-full border border-line bg-background px-3 py-3 font-mono text-xs"
            />
          </label>

          <button type="submit" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
            Importer les produits
          </button>
        </form>

        <div className="grid gap-5">
          <div className="border border-line bg-surface p-6">
            <h3 className="font-serif text-2xl">Sequence recommandee</h3>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <li>1. Importer les references et les identifiants stock.</li>
              <li>2. Ouvrir un produit depuis la liste admin.</li>
              <li>3. Uploader les images sur la fiche produit via Cloudflare R2.</li>
              <li>4. Generer un brouillon IA sur la fiche si utile.</li>
              <li>5. Relire, corriger puis passer le statut en `active`.</li>
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted">
              Le multi-upload d&apos;images n&apos;est disponible qu&apos;apres creation du produit, depuis la page
              d&apos;edition.
            </p>
          </div>
          <div className="border border-line bg-surface p-6">
            <h3 className="font-serif text-2xl">Liens utiles</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/admin/products" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
                Retour produits
              </Link>
              <Link href="/boutique" className="border border-line px-4 py-2 text-sm font-bold">
                Voir la boutique
              </Link>
            </div>
          </div>
          <div className="border border-line bg-surface p-6">
            <h3 className="font-serif text-2xl">Historique recent</h3>
            <form className="mt-4 grid gap-3 border border-line p-4 text-sm" method="GET">
              <input type="hidden" name="eventId" value="" />
              <label className="grid gap-2">
                <span className="font-bold">Statut</span>
                <select name="status" defaultValue={query.status ?? ""} className="border border-line bg-background px-3 py-3">
                  <option value="">Tous</option>
                  <option value="success">success</option>
                  <option value="partial">partial</option>
                  <option value="failed">failed</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="font-bold">Auteur</span>
                <input
                  name="actorEmail"
                  defaultValue={query.actorEmail ?? ""}
                  className="border border-line bg-background px-3 py-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="font-bold">Lot</span>
                <input
                  name="batchLabel"
                  defaultValue={query.batchLabel ?? ""}
                  className="border border-line bg-background px-3 py-3"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
                  Filtrer
                </button>
                <Link href="/admin/products/new" className="border border-line px-4 py-2 text-sm font-bold">
                  Reinitialiser
                </Link>
              </div>
            </form>
            <div className="mt-4 grid gap-3 text-sm">
              {recentEvents.map((event) => (
                <article key={event.id} className="border border-line p-4">
                  <div className="flex items-center justify-between gap-4">
                    <strong>{event.status}</strong>
                    <span className="text-xs text-muted">{new Date(event.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-muted">
                    <p>Auteur: {event.actorEmail ?? "inconnu"}</p>
                    <p>Lot: {event.batchLabel ?? "sans libelle"}</p>
                  </div>
                  {event.message ? <p className="mt-2 text-muted">{event.message}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link href={`/admin/products/new?eventId=${event.id}`} className="text-sm font-bold hover:text-terracotta">
                      Voir le rapport
                    </Link>
                    <Link
                      href={`/api/admin/products/import-errors?eventId=${event.id}`}
                      className="text-sm font-bold hover:text-terracotta"
                    >
                      Export erreurs
                    </Link>
                  </div>
                </article>
              ))}
              {recentEvents.length === 0 ? <p className="text-muted">Aucun import catalogue enregistre.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
