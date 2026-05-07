"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPriceCents } from "@/features/product/format";

type PreviewItem = {
  shopcaisseProductId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  stockQuantity: number | null;
  familyName: string | null;
  alreadyImported: boolean;
};

type FamilyStat = {
  name: string;
  totalCount: number;
  inStockCount: number;
  outOfStockCount: number;
};

type PreviewResponse = {
  success: boolean;
  availableFamilies: string[];
  familyStats: FamilyStat[];
  selectedFamily: string | null;
  selectedFamilies: string[];
  totalCacheItems: number;
  importableCount: number;
  alreadyLinkedCount: number;
  missingPriceCount: number;
  missingStockCount: number;
  missingImageCount: number;
  sampleItems: PreviewItem[];
  page: number;
  limit: number;
  totalPages: number;
  q: string | null;
  hasStock: boolean | null;
  hasPrice: boolean | null;
  checkedAt: string;
  message?: string;
};

type ImportResponse = {
  success: boolean;
  createdCount: number;
  skippedCount: number;
  linkedCount: number;
  errors: Array<{ shopcaisseProductId: string; message: string }>;
  importedAt: string;
};

type ValidationResponse = {
  success: boolean;
  status: number;
  message: string;
  companyId: string | null;
  storeId: string | null;
  posId: string | null;
  detectedResources: string[];
  usefulPermissions: string[];
  checkedAt: string;
};

type SyncResponse = {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: Array<{ externalProductId: string; message: string }>;
  syncedAt: string;
};

type ImportMode = "families" | "selected" | "all" | "in_stock_only";
type PreviewFilter = "all" | "importable" | "linked" | "no_stock" | "no_price" | "no_image";

type Props = {
  lastCatalogSuccessAt?: string;
  lastCatalogErrorMessage?: string;
  lastImportSuccessAt?: string;
  lastImportErrorMessage?: string;
};

const PREVIEW_LIMIT_OPTIONS = [10, 20, 30] as const;
const STEP_TITLES = [
  "Connexion",
  "Familles",
  "Strategie",
  "Previsualisation",
  "Confirmation",
  "Resultat",
] as const;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDateTime(value?: string) {
  return value ? new Date(value).toLocaleString("fr-FR") : null;
}

function getImportModeLabel(mode: ImportMode) {
  switch (mode) {
    case "families":
      return "Importer les familles choisies";
    case "selected":
      return "Importer uniquement les lignes cochees";
    case "in_stock_only":
      return "Importer uniquement les produits en stock";
    case "all":
      return "Importer tout le cache filtre";
  }
}

function getImportButtonLabel(mode: ImportMode, publishByDefault: boolean, count: number) {
  const suffix = publishByDefault ? "publies" : "en brouillon";
  const noun = count > 1 ? "produits" : "produit";
  return `Importer ${count} ${noun} ${suffix}`;
}

export function ShopcaisseImportPanel({
  lastCatalogSuccessAt,
  lastCatalogErrorMessage,
  lastImportSuccessAt,
  lastImportErrorMessage,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [catalogSync, setCatalogSync] = useState<SyncResponse | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const [connectionLoading, setConnectionLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [familyStockOnly, setFamilyStockOnly] = useState(false);
  const [previewLimit, setPreviewLimit] = useState<(typeof PREVIEW_LIMIT_OPTIONS)[number]>(10);
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>("all");
  const [publishByDefault, setPublishByDefault] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>("families");

  useEffect(() => {
    void handlePreview(1);
    // Needed to expose families immediately and preload onboarding stats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFamilyStats = useMemo(() => {
    const normalizedQuery = familySearch.trim().toLowerCase();

    return (preview?.familyStats ?? []).filter((family) => {
      const matchesQuery = normalizedQuery.length === 0 || family.name.toLowerCase().includes(normalizedQuery);
      const matchesStock = !familyStockOnly || family.inStockCount > 0;
      return matchesQuery && matchesStock;
    });
  }, [familySearch, familyStockOnly, preview?.familyStats]);

  const visiblePreviewItems = useMemo(() => {
    const items = preview?.sampleItems ?? [];

    return items.filter((item) => {
      switch (previewFilter) {
        case "importable":
          return !item.alreadyImported && item.priceCents !== null;
        case "linked":
          return item.alreadyImported;
        case "no_stock":
          return item.stockQuantity === null || item.stockQuantity <= 0;
        case "no_price":
          return item.priceCents === null;
        case "no_image":
          return !item.imageUrl;
        case "all":
        default:
          return true;
      }
    });
  }, [preview?.sampleItems, previewFilter]);

  const estimatedImportCount = useMemo(() => {
    if (!preview) {
      return 0;
    }

    switch (importMode) {
      case "selected":
        return selectedIds.length;
      case "families":
        return preview.importableCount;
      case "in_stock_only":
        return Math.max(0, preview.importableCount - preview.missingStockCount);
      case "all":
        return preview.importableCount;
    }
  }, [importMode, preview, selectedIds.length]);

  function toggleSelected(shopcaisseProductId: string) {
    setSelectedIds((current) =>
      current.includes(shopcaisseProductId)
        ? current.filter((id) => id !== shopcaisseProductId)
        : [...current, shopcaisseProductId],
    );
  }

  function toggleFamily(familyName: string) {
    setSelectedFamilies((current) =>
      current.includes(familyName) ? current.filter((value) => value !== familyName) : [...current, familyName],
    );
  }

  async function handleValidateConnection() {
    setConnectionLoading(true);

    try {
      const response = await fetch("/api/shopcaisse/validate", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as ValidationResponse;
      setValidation(payload);

      if (payload.success) {
        setCurrentStep((current) => Math.max(current, 2));
      }
    } catch {
      setValidation({
        success: false,
        status: 500,
        message: "Impossible de contacter le serveur de validation Shopcaisse.",
        companyId: null,
        storeId: null,
        posId: null,
        detectedResources: [],
        usefulPermissions: [],
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setConnectionLoading(false);
    }
  }

  async function handleSyncCatalog() {
    setSyncLoading(true);

    try {
      const response = await fetch("/api/shopcaisse/catalog/sync", {
        method: "POST",
      });
      const payload = (await response.json()) as SyncResponse;
      setCatalogSync(payload);

      if (response.ok) {
        await handlePreview(1);
        setCurrentStep((current) => Math.max(current, 2));
      }
    } catch {
      setCatalogSync({
        success: false,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errors: [{ externalProductId: "unknown", message: "Impossible de synchroniser le catalogue Shopcaisse." }],
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setSyncLoading(false);
    }
  }

  async function handlePreview(page = 1) {
    setPreviewLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(previewLimit),
      });

      if (query.trim()) {
        params.set("q", query.trim());
      }

      for (const familyName of selectedFamilies) {
        params.append("familyNames", familyName);
      }

      const response = await fetch(`/api/admin/shopcaisse/import-preview?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as PreviewResponse;
      setPreview(payload);
      setBrokenImages([]);
      setSelectedIds(
        payload.success
          ? payload.sampleItems
              .filter((item) => !item.alreadyImported && item.priceCents !== null)
              .map((item) => item.shopcaisseProductId)
          : [],
      );

      if (payload.selectedFamilies.length > 0) {
        setSelectedFamilies(payload.selectedFamilies);
      }

      if (response.ok) {
        setCurrentStep((current) => Math.max(current, 4));
      }
    } catch {
      setPreview({
        success: false,
        availableFamilies: [],
        familyStats: [],
        selectedFamily: null,
        selectedFamilies: [],
        totalCacheItems: 0,
        importableCount: 0,
        alreadyLinkedCount: 0,
        missingPriceCount: 0,
        missingStockCount: 0,
        missingImageCount: 0,
        sampleItems: [],
        page: 1,
        limit: previewLimit,
        totalPages: 1,
        q: null,
        hasStock: null,
        hasPrice: null,
        checkedAt: new Date().toISOString(),
        message: "Impossible de previsualiser l'import Shopcaisse.",
      });
      setSelectedIds([]);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleImport() {
    if (importMode === "selected" && selectedIds.length === 0) {
      setImportResult({
        success: false,
        createdCount: 0,
        skippedCount: 0,
        linkedCount: 0,
        errors: [{ shopcaisseProductId: "selection", message: "Selectionne au moins une ligne dans la previsualisation." }],
        importedAt: new Date().toISOString(),
      });
      setCurrentStep(6);
      return;
    }

    if (importMode === "families" && selectedFamilies.length === 0) {
      setImportResult({
        success: false,
        createdCount: 0,
        skippedCount: 0,
        linkedCount: 0,
        errors: [{ shopcaisseProductId: "families", message: "Selectionne au moins une famille avant l'import." }],
        importedAt: new Date().toISOString(),
      });
      setCurrentStep(6);
      return;
    }

    setImportLoading(true);

    try {
      const response = await fetch("/api/admin/shopcaisse/import-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: importMode,
          shopcaisseProductIds: importMode === "selected" ? selectedIds : undefined,
          familyNames: importMode === "families" ? selectedFamilies : undefined,
          publishByDefault,
        }),
      });
      const payload = (await response.json()) as ImportResponse;
      setImportResult(payload);
      setCurrentStep(6);

      if (response.ok) {
        await handlePreview(preview?.page ?? 1);
      }
    } catch {
      setImportResult({
        success: false,
        createdCount: 0,
        skippedCount: 0,
        linkedCount: 0,
        errors: [{ shopcaisseProductId: "unknown", message: "Impossible d'importer les produits Shopcaisse." }],
        importedAt: new Date().toISOString(),
      });
      setCurrentStep(6);
    } finally {
      setImportLoading(false);
    }
  }

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  return (
    <section className="border border-line bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-title text-terracotta">Import Shopcaisse</p>
          <h3 className="mt-2 font-serif text-4xl">Assistant d&apos;onboarding catalogue</h3>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            Le parcours guide l&apos;administrateur depuis la connexion Shopcaisse jusqu&apos;a l&apos;import final, sans
            changer la logique metier existante.
          </p>
        </div>
        <div className="border border-line bg-background px-4 py-3 text-sm">
          <div>
            Derniere sync:{" "}
            <strong>{formatDateTime(catalogSync?.syncedAt ?? lastCatalogSuccessAt) ?? "Aucune synchronisation"}</strong>
          </div>
          <div className="mt-2">
            Dernier import:{" "}
            <strong>{formatDateTime(importResult?.importedAt ?? lastImportSuccessAt) ?? "Aucun import"}</strong>
          </div>
        </div>
      </div>

      <ol className="mt-8 grid gap-3 lg:grid-cols-6">
        {STEP_TITLES.map((title, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const complete = step < currentStep;

          return (
            <li key={title}>
              <button
                type="button"
                onClick={() => goToStep(step)}
                className={cn(
                  "flex w-full items-center gap-3 border px-4 py-3 text-left",
                  active && "border-brand bg-brand text-brand-contrast",
                  !active && complete && "border-accent bg-background text-accent",
                  !active && !complete && "border-line bg-background",
                )}
              >
                <span className="font-serif text-2xl leading-none">{step}</span>
                <span className="text-sm font-bold">{title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8">
        {currentStep === 1 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="font-serif text-3xl">1. Connexion Shopcaisse</h4>
              <p className="mt-2 text-sm text-muted">
                Verifie la cle Shopcaisse, puis rafraichit le cache catalogue local avant toute selection.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="border border-line bg-background p-5">
                <div className="flex items-center justify-between gap-4">
                  <strong>Statut de connexion</strong>
                  <span className={validation?.success ? "font-bold text-accent" : "font-bold text-muted"}>
                    {validation ? (validation.success ? "Valide" : "A verifier") : "Non verifie"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {validation?.message ?? "Aucune verification recente. Lance d'abord un test de connexion."}
                </p>
                <p className="mt-3 text-xs text-muted">
                  Dernier test: {formatDateTime(validation?.checkedAt) ?? "Jamais"}
                </p>
                <button
                  type="button"
                  onClick={handleValidateConnection}
                  disabled={connectionLoading}
                  className="mt-5 bg-brand px-4 py-3 text-sm font-bold text-brand-contrast disabled:opacity-60"
                >
                  {connectionLoading ? "Verification..." : "Tester la connexion"}
                </button>
              </article>

              <article className="border border-line bg-background p-5">
                <div className="flex items-center justify-between gap-4">
                  <strong>Catalogue local</strong>
                  <span className={catalogSync?.success ? "font-bold text-accent" : "font-bold text-muted"}>
                    {catalogSync ? (catalogSync.success ? "Synchronise" : "A verifier") : "Pret a synchroniser"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {catalogSync
                    ? catalogSync.success
                      ? "Le cache local Prisma vient d'etre mis a jour."
                      : catalogSync.errors[0]?.message ?? "La synchronisation a echoue."
                    : "Synchronise le catalogue Shopcaisse pour rafraichir les familles et les produits importables."}
                </p>
                <div className="mt-4 grid gap-2 text-xs text-muted md:grid-cols-3">
                  <div className="border border-line p-3">Crees: {catalogSync?.createdCount ?? 0}</div>
                  <div className="border border-line p-3">Mis a jour: {catalogSync?.updatedCount ?? 0}</div>
                  <div className="border border-line p-3">Ignores: {catalogSync?.skippedCount ?? 0}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncCatalog}
                  disabled={syncLoading}
                  className="mt-5 border border-line px-4 py-3 text-sm font-bold disabled:opacity-60"
                >
                  {syncLoading ? "Synchronisation..." : "Synchroniser le catalogue"}
                </button>
              </article>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast"
              >
                Passer a la selection des familles
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="font-serif text-3xl">2. Selection des familles</h4>
              <p className="mt-2 text-sm text-muted">
                Choisis les familles a travailler. La previsualisation et l&apos;import se baseront sur cette selection.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <label className="text-sm font-bold">
                Recherche par famille
                <input
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                  placeholder="Bijoux, luminaire, senteurs..."
                  className="mt-2 w-full border border-line bg-background px-3 py-3"
                />
              </label>
              <label className="flex items-center gap-3 self-end border border-line bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={familyStockOnly}
                  onChange={(event) => setFamilyStockOnly(event.target.checked)}
                />
                Afficher uniquement les familles avec stock
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredFamilyStats.map((family) => {
                const active = selectedFamilies.includes(family.name);

                return (
                  <button
                    key={family.name}
                    type="button"
                    onClick={() => toggleFamily(family.name)}
                    className={cn(
                      "border p-4 text-left",
                      active ? "border-brand bg-brand text-brand-contrast" : "border-line bg-background",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <strong>{family.name}</strong>
                      <span className="text-xs font-bold">{family.totalCount} produits</span>
                    </div>
                    <div className={cn("mt-4 grid gap-2 text-xs", active ? "text-brand-contrast/90" : "text-muted")}>
                      <div>En stock: {family.inStockCount}</div>
                      <div>Sans stock: {family.outOfStockCount}</div>
                    </div>
                  </button>
                );
              })}
              {filteredFamilyStats.length === 0 ? (
                <div className="border border-line bg-background p-4 text-sm text-muted">
                  Aucune famille ne correspond aux filtres actuels.
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border border-line bg-background p-4 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <strong>{selectedFamilies.length}</strong> famille(s) selectionnee(s)
                <p className="mt-1 text-xs text-muted">
                  {selectedFamilies.length > 0 ? selectedFamilies.join(", ") : "Selectionne au moins une famille pour continuer."}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePreview(1)}
                  disabled={previewLoading || selectedFamilies.length === 0}
                  className="border border-line px-4 py-3 text-sm font-bold disabled:opacity-60"
                >
                  {previewLoading ? "Actualisation..." : "Actualiser les familles choisies"}
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={selectedFamilies.length === 0}
                  className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast disabled:opacity-60"
                >
                  Continuer vers la strategie
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {currentStep === 3 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="font-serif text-3xl">3. Strategie d&apos;import</h4>
              <p className="mt-2 text-sm text-muted">
                Choisis le mode d&apos;import deja supporte par le backend. Le mode brouillon reste recommande.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => setPublishByDefault(false)}
                className={cn(
                  "border p-5 text-left",
                  !publishByDefault ? "border-brand bg-brand text-brand-contrast" : "border-line bg-background",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>Importer en brouillon</strong>
                  <span className="text-xs font-bold">Recommande</span>
                </div>
                <p className={cn("mt-3 text-sm", !publishByDefault ? "text-brand-contrast/90" : "text-muted")}>
                  Les produits restent invisibles tant qu&apos;ils ne sont pas verifies dans le catalogue storefront.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPublishByDefault(true)}
                className={cn(
                  "border p-5 text-left",
                  publishByDefault ? "border-brand bg-brand text-brand-contrast" : "border-line bg-background",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>Importer et publier automatiquement</strong>
                  <span className="text-xs font-bold">Non recommande</span>
                </div>
                <p className={cn("mt-3 text-sm", publishByDefault ? "text-brand-contrast/90" : "text-muted")}>
                  A utiliser seulement si le lot est deja prepare editorialement et controle.
                </p>
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {([
                ["families", "Importer les familles selectionnees", "Importe toutes les lignes des familles choisies."],
                ["selected", "Importer uniquement les lignes cochees", "Limite l'import aux lignes visibles et cochees dans la previsualisation."],
                ["in_stock_only", "Importer uniquement les produits en stock", "Utilise le mode global deja disponible cote serveur."],
                ["all", "Importer tout le cache filtre", "Importe tout ce qui est visible dans le cache filtre courant."],
              ] as const).map(([mode, title, description]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setImportMode(mode)}
                  className={cn(
                    "border p-4 text-left",
                    importMode === mode ? "border-brand bg-brand text-brand-contrast" : "border-line bg-background",
                  )}
                >
                  <strong>{title}</strong>
                  <p className={cn("mt-2 text-sm", importMode === mode ? "text-brand-contrast/90" : "text-muted")}>
                    {description}
                  </p>
                </button>
              ))}
            </div>

            <div className="border border-line bg-background p-4 text-sm">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions((current) => !current)}
                className="font-bold"
              >
                {showAdvancedOptions ? "Masquer les options avancees" : "Afficher les options avancees"}
              </button>
              {showAdvancedOptions ? (
                <div className="mt-4 grid gap-3 text-sm text-muted">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly />
                    Les produits sans prix sont ignores par la logique actuelle.
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly />
                    Les categories manquantes sont creees automatiquement a partir de la famille.
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={importMode === "in_stock_only"} readOnly />
                    Le mode &quot;en stock uniquement&quot; reste un mode d&apos;import dedie, pas une case cumulable.
                  </label>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  void handlePreview(1);
                  goToStep(4);
                }}
                className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast"
              >
                Passer a la previsualisation
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 4 ? (
          <section className="grid gap-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h4 className="font-serif text-3xl">4. Previsualisation</h4>
                <p className="mt-2 text-sm text-muted">
                  Controle le lot avant import. La pagination suit exactement le filtre courant.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm font-bold">
                  Recherche produit
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nom, SKU, barcode"
                    className="mt-2 w-64 border border-line bg-background px-3 py-3"
                  />
                </label>
                <label className="text-sm font-bold">
                  Produits par page
                  <select
                    value={previewLimit}
                    onChange={(event) => setPreviewLimit(Number(event.target.value) as (typeof PREVIEW_LIMIT_OPTIONS)[number])}
                    className="mt-2 border border-line bg-background px-3 py-3"
                  >
                    {PREVIEW_LIMIT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => handlePreview(1)}
                  disabled={previewLoading}
                  className="border border-line px-4 py-3 text-sm font-bold disabled:opacity-60"
                >
                  {previewLoading ? "Previsualisation..." : "Previsualiser les produits"}
                </button>
              </div>
            </header>

            {preview ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <div className="border border-line bg-background p-4">Produits trouves: {preview.totalCacheItems}</div>
                  <div className="border border-line bg-background p-4">Produits importables: {preview.importableCount}</div>
                  <div className="border border-line bg-background p-4">Deja presents: {preview.alreadyLinkedCount}</div>
                  <div className="border border-line bg-background p-4">Sans prix: {preview.missingPriceCount}</div>
                  <div className="border border-line bg-background p-4">Sans stock: {preview.missingStockCount}</div>
                  <div className="border border-line bg-background p-4">Sans image: {preview.missingImageCount}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {([
                    ["all", "Tous"],
                    ["importable", "Importables"],
                    ["linked", "Deja importes"],
                    ["no_stock", "Sans stock"],
                    ["no_price", "Sans prix"],
                    ["no_image", "Sans image"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreviewFilter(value)}
                      className={cn(
                        "border px-3 py-2 text-xs font-bold",
                        previewFilter === value ? "border-brand bg-brand text-brand-contrast" : "border-line bg-background",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <article className="border border-line bg-background p-4 text-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <strong>Produits previsualises</strong>
                    <span className="text-muted">
                      Selection locale: {selectedIds.length} · Page {preview.page}/{preview.totalPages}
                    </span>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs uppercase text-muted">
                        <tr>
                          <th className="px-3 py-2">Choix</th>
                          <th className="px-3 py-2">Photo</th>
                          <th className="px-3 py-2">Nom</th>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2">Code-barres</th>
                          <th className="px-3 py-2">Famille</th>
                          <th className="px-3 py-2">Prix</th>
                          <th className="px-3 py-2">Stock</th>
                          <th className="px-3 py-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiblePreviewItems.length > 0 ? (
                          visiblePreviewItems.map((item) => {
                            const disabled = item.alreadyImported || item.priceCents === null;
                            const status = item.alreadyImported
                              ? "Deja importe"
                              : item.priceCents === null
                                ? "Sans prix"
                                : (item.stockQuantity ?? 0) > 0
                                  ? "Importable"
                                  : "Sans stock";

                            return (
                              <tr key={item.shopcaisseProductId} className="border-t border-line">
                                <td className="px-3 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.shopcaisseProductId)}
                                    disabled={disabled}
                                    onChange={() => toggleSelected(item.shopcaisseProductId)}
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  {item.imageUrl && !brokenImages.includes(item.shopcaisseProductId) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="h-14 w-14 rounded border border-line object-cover"
                                      loading="lazy"
                                      onError={() =>
                                        setBrokenImages((current) =>
                                          current.includes(item.shopcaisseProductId)
                                            ? current
                                            : [...current, item.shopcaisseProductId],
                                        )
                                      }
                                    />
                                  ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-line text-[10px] text-muted">
                                      Aucune image
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="font-bold">{item.name}</div>
                                  <code className="text-xs text-muted">{item.shopcaisseProductId}</code>
                                </td>
                                <td className="px-3 py-3">{item.sku ?? "-"}</td>
                                <td className="px-3 py-3">{item.barcode ?? "-"}</td>
                                <td className="px-3 py-3">{item.familyName ?? "-"}</td>
                                <td className="px-3 py-3">
                                  {item.priceCents !== null ? formatPriceCents(item.priceCents) : "-"}
                                </td>
                                <td className="px-3 py-3">{item.stockQuantity ?? "-"}</td>
                                <td className="px-3 py-3">{status}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-3 py-6 text-center text-muted">
                              Aucun produit ne correspond aux filtres visibles.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted">
                      Pages disponibles:{" "}
                      <strong className="text-foreground">
                        {preview.totalPages} page{preview.totalPages > 1 ? "s" : ""}
                      </strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {preview.page > 1 ? (
                        <button
                          type="button"
                          onClick={() => handlePreview(preview.page - 1)}
                          disabled={previewLoading}
                          className="border border-line px-3 py-2 text-sm font-bold disabled:opacity-60"
                        >
                          Page precedente
                        </button>
                      ) : null}
                      {Array.from({ length: preview.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handlePreview(pageNumber)}
                          disabled={previewLoading}
                          className={cn(
                            "border px-3 py-2 text-sm font-bold disabled:opacity-60",
                            pageNumber === preview.page ? "border-brand bg-brand text-brand-contrast" : "border-line",
                          )}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      {preview.page < preview.totalPages ? (
                        <button
                          type="button"
                          onClick={() => handlePreview(preview.page + 1)}
                          disabled={previewLoading}
                          className="border border-line px-3 py-2 text-sm font-bold disabled:opacity-60"
                        >
                          Page suivante
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              </>
            ) : (
              <div className="border border-line bg-background p-4 text-sm text-muted">
                Aucune previsualisation disponible pour le moment.
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(5)}
                disabled={!preview?.success}
                className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast disabled:opacity-60"
              >
                Continuer vers la confirmation
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 5 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="font-serif text-3xl">5. Confirmation</h4>
              <p className="mt-2 text-sm text-muted">
                Verifie une derniere fois le perimetre de l&apos;import avant de lancer l&apos;action.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="border border-line bg-background p-5 text-sm">
                <strong>Resume d&apos;import</strong>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span>Mode choisi</span>
                    <strong>{getImportModeLabel(importMode)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Familles concernees</span>
                    <strong>{selectedFamilies.length > 0 ? selectedFamilies.join(", ") : "Toutes les familles"}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Statut final</span>
                    <strong>{publishByDefault ? "Publie" : "Brouillon"}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Produits vises</span>
                    <strong>{estimatedImportCount}</strong>
                  </div>
                </div>
              </article>

              <article className="border border-line bg-background p-5 text-sm">
                <strong>Regles d&apos;exclusion</strong>
                <ul className="mt-4 grid gap-2 text-muted">
                  <li>Les produits sans prix restent ignores par la logique actuelle.</li>
                  <li>Les produits deja lies ne sont pas recrées en doublon.</li>
                  <li>Les familles non selectionnees restent hors perimetre.</li>
                  <li>Les images restent optionnelles et sont traitees a part si necessaire.</li>
                </ul>
              </article>
            </div>

            {publishByDefault ? (
              <div className="border border-terracotta bg-background p-4 text-sm text-terracotta">
                La publication automatique est activee. Verifie attentivement la previsualisation avant de confirmer.
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={importLoading || estimatedImportCount === 0}
                className="bg-brand px-5 py-3 text-sm font-bold text-brand-contrast disabled:opacity-60"
              >
                {importLoading
                  ? "Import en cours..."
                  : getImportButtonLabel(importMode, publishByDefault, Math.max(estimatedImportCount, 0))}
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 6 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="font-serif text-3xl">6. Resultat</h4>
              <p className="mt-2 text-sm text-muted">Le resultat reprend la reponse reelle du backend, sans changer la logique d&apos;import existante.</p>
            </header>

            {importResult ? (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div className="border border-line bg-background p-4">Importes: {importResult.createdCount}</div>
                  <div className="border border-line bg-background p-4">Lies: {importResult.linkedCount}</div>
                  <div className="border border-line bg-background p-4">Ignores: {importResult.skippedCount}</div>
                  <div className="border border-line bg-background p-4">Erreurs: {importResult.errors.length}</div>
                  <div className="border border-line bg-background p-4">Sans image: {preview?.missingImageCount ?? 0}</div>
                </div>

                <article className="border border-line bg-background p-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <strong className={importResult.success ? "text-accent" : "text-terracotta"}>
                      {importResult.success ? "Import termine" : "Import partiel ou en echec"}
                    </strong>
                    <span>{formatDateTime(importResult.importedAt)}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {importResult.errors.length > 0 ? (
                      importResult.errors.slice(0, 10).map((error) => (
                        <div key={`${error.shopcaisseProductId}:${error.message}`} className="border border-line p-3 text-muted">
                          <code>{error.shopcaisseProductId}</code> {error.message}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Aucune erreur remontee par le backend.</p>
                    )}
                  </div>
                </article>
              </>
            ) : (
              <div className="border border-line bg-background p-4 text-sm text-muted">
                Aucun import n&apos;a encore ete lance dans cette session.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a href="/admin/products" className="border border-line px-4 py-3 text-sm font-bold">
                Voir les produits importes
              </a>
              <a href="/admin/products/missing-images" className="border border-line px-4 py-3 text-sm font-bold">
                Voir les produits sans image
              </a>
              <button
                type="button"
                onClick={() => {
                  void handlePreview(1);
                  goToStep(4);
                }}
                className="border border-line px-4 py-3 text-sm font-bold"
              >
                Relancer une previsualisation
              </button>
            </div>
          </section>
        ) : null}

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <article className="border border-line p-4">
            <strong>Dernier succes import</strong>
            <p className="mt-2 text-muted">
              {lastImportSuccessAt ? formatDateTime(lastImportSuccessAt) : "Aucun import storefront reussi."}
            </p>
          </article>
          <article className="border border-line p-4">
            <strong>Derniere erreur import</strong>
            <p className="mt-2 text-muted">{lastImportErrorMessage ?? "Aucune erreur import enregistree."}</p>
          </article>
          <article className="border border-line p-4">
            <strong>Dernier succes catalogue</strong>
            <p className="mt-2 text-muted">
              {lastCatalogSuccessAt ? formatDateTime(lastCatalogSuccessAt) : "Aucun succes catalogue enregistre."}
            </p>
          </article>
          <article className="border border-line p-4">
            <strong>Derniere erreur catalogue</strong>
            <p className="mt-2 text-muted">{lastCatalogErrorMessage ?? "Aucune erreur catalogue enregistree."}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
