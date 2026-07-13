import test from "node:test";
import assert from "node:assert/strict";

const { buildProductsMissingImagesWhere } = (await import(
  new URL("./shopcaisse-product-missing-images.query.ts", import.meta.url).href
)) as typeof import("./shopcaisse-product-missing-images.query");

test("exclut toujours les produits archivés", () => {
  assert.deepEqual(buildProductsMissingImagesWhere({}), {
    AND: [{ images: { none: {} } }, { status: { not: "archived" } }],
  });
});

test("un filtre de statut reste combiné à l'exclusion des archives", () => {
  assert.deepEqual(buildProductsMissingImagesWhere({ status: "active" }), {
    AND: [
      { images: { none: {} } },
      { status: { not: "archived" } },
      { status: "active" },
    ],
  });
});

test("conserve les filtres famille, recherche, stock et Shopcaisse", () => {
  assert.deepEqual(
    buildProductsMissingImagesWhere({
      family: "Vases",
      q: "bleu",
      withStockOnly: true,
      shopcaisseOnly: true,
    }),
    {
      AND: [
        { images: { none: {} } },
        { status: { not: "archived" } },
        {
          categories: {
            some: {
              category: {
                slug: "vases",
              },
            },
          },
        },
        { stock: { gt: 0 } },
        { externalProvider: "shopcaisse" },
        {
          OR: [
            { title: { contains: "bleu", mode: "insensitive" } },
            { sku: { contains: "bleu", mode: "insensitive" } },
            { barcode: { contains: "bleu", mode: "insensitive" } },
          ],
        },
      ],
    },
  );
});
