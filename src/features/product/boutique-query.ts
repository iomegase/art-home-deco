type BoutiqueQueryInput = {
  q?: string | null;
  categorie?: string | null;
  page?: number | null;
};

export function buildBoutiqueQueryString(input: BoutiqueQueryInput) {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  const categorie = input.categorie?.trim();
  const page = input.page ?? 1;

  if (q) {
    params.set("q", q);
  }

  if (categorie) {
    params.set("categorie", categorie);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params.toString();
}

export function buildBoutiqueHref(input: BoutiqueQueryInput) {
  const query = buildBoutiqueQueryString(input);
  return query ? `/boutique?${query}` : "/boutique";
}
