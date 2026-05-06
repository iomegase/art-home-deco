import assert from "node:assert/strict";
import test from "node:test";
import { buildBlogArticleJsonLd, buildBlogMetadata, formatSeoTitle, stringifyJsonLd } from "./seo";

test("buildBlogMetadata prefers seo fields", () => {
  const publishedAt = new Date("2026-05-05T10:00:00.000Z");
  const metadata = buildBlogMetadata({
    slug: "titre",
    title: "Titre",
    seoTitle: "Meta titre",
    excerpt: "Extrait",
    seoDescription: "Meta description",
    imageUrl: "https://example.com/img.jpg",
    imageAlt: "Bougies parfumées artisanales dans un intérieur chaleureux",
    category: "Conseil déco",
    publishedAt,
    updatedAt: publishedAt,
  });

  assert.deepEqual(metadata.title, { absolute: "Meta titre | Art Home Déco" });
  assert.equal(metadata.description, "Meta description");
  assert.deepEqual(metadata.alternates, { canonical: "http://localhost:3000/blog/titre" });
  assert.equal((metadata.openGraph as { type?: string } | undefined)?.type, "article");
});

test("buildBlogMetadata sanitizes malformed image URLs", () => {
  const publishedAt = new Date("2026-05-05T10:00:00.000Z");
  const metadata = buildBlogMetadata({
    slug: "titre",
    title: "Titre",
    seoTitle: null,
    excerpt: "Extrait",
    seoDescription: null,
    imageUrl:
      "https://imhttps://plus.unsplash.com/premium_photo-1723826750819-02ee8f2e5a0c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dages.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85",
    imageAlt: null,
    category: null,
    publishedAt,
    updatedAt: publishedAt,
  });

  const openGraphImage = (metadata.openGraph as { images?: Array<{ url?: string }> } | undefined)?.images?.[0];
  assert.equal(
    openGraphImage?.url,
    "https://plus.unsplash.com/premium_photo-1723826750819-02ee8f2e5a0c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  );
});

test("buildBlogArticleJsonLd keeps article basics", () => {
  const publishedAt = new Date("2026-05-05T10:00:00.000Z");
  const jsonLd = buildBlogArticleJsonLd({
    slug: "titre",
    title: "Titre",
    seoTitle: null,
    excerpt: "Extrait",
    seoDescription: null,
    imageUrl: null,
    imageAlt: null,
    category: "Conseil déco",
    publishedAt,
    updatedAt: publishedAt,
  });

  assert.equal(jsonLd["@type"], "BlogPosting");
  assert.equal(jsonLd.headline, "Titre");
  assert.equal(jsonLd.description, "Extrait");
  assert.equal(jsonLd.datePublished, publishedAt.toISOString());
  assert.equal(jsonLd.dateModified, publishedAt.toISOString());
  assert.equal(jsonLd.mainEntityOfPage["@id"], "http://localhost:3000/blog/titre");
  assert.equal(jsonLd.publisher.logo.url, "http://localhost:3000/logo.png");
  assert.equal(jsonLd.articleSection, "Conseil déco");
});

test("formatSeoTitle normalizes brand and avoids duplicates", () => {
  assert.equal(formatSeoTitle("Déco Maroc | Art Home Déco | Art Home Deco"), "Déco Maroc | Art Home Déco");
  assert.equal(formatSeoTitle("Le regard Art Home Deco sur les chalets"), "Le regard Art Home Déco sur les chalets");
});

test("stringifyJsonLd escapes html-sensitive characters", () => {
  assert.equal(stringifyJsonLd({ headline: "<script>" }), '{"headline":"\\u003cscript>"}');
});
