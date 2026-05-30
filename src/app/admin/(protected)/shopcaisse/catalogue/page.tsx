import { listCacheForCuration } from "@/server/repositories/shopcaisse-catalog.repository";
import { db } from "@/server/db/client";
import { CatalogueCuration } from "./catalogue-curation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ familyId?: string; q?: string; page?: string }>;

export default async function ShopcaisseCataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const { familyId, q, page } = await searchParams;

  const categories = await db.category.findMany({
    where: { externalFamilyId: { not: null } },
    select: { externalFamilyId: true, title: true },
    orderBy: [{ position: "asc" }, { title: "asc" }],
  });

  const data = await listCacheForCuration({
    familyId: familyId ?? null,
    q: q ?? null,
    page: page ? Number(page) : 1,
    pageSize: 50,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl">Catalogue Shopcaisse — curation</h1>
      <p className="mt-2 text-sm text-muted">
        Choisissez, par catégorie, les articles présents sur le site. Publier crée un brouillon ; activez-le pour le mettre en ligne.
      </p>
      <CatalogueCuration
        categories={categories.map((category) => ({
          familyId: category.externalFamilyId as string,
          title: category.title,
        }))}
        rows={data.rows.map((row) => ({
          id: row.id,
          shopcaisseProductId: row.shopcaisseProductId,
          name: row.name,
          sku: row.sku,
          priceCents: row.priceCents,
          stockQuantity: row.stockQuantity,
          hasImage: Boolean(row.imageUrl),
          linkedProductId: row.linkedProductId,
          status: row.linkedProduct?.status ?? null,
        }))}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        activeFamilyId={familyId ?? ""}
        query={q ?? ""}
      />
    </div>
  );
}
