"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPriceCents } from "@/features/product/format";
import {
  buildShopcaisseImportPayload,
  canContinueToShopcaisseImportConfirmation,
  clearShopcaisseImportSelection,
  resolveShopcaissePreviewSelection,
  toggleShopcaisseImportSelection,
  type ShopcaisseImportMode as ImportMode,
} from "@/features/product/shopcaisse-import-selection";

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

function getCompactPages(currentPage: number, totalPages: number) {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
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
    const next = toggleShopcaisseImportSelection(selectedIds, shopcaisseProductId);
    setSelectedIds(next.selectedIds);
    setImportMode(next.importMode);
  }

  function clearSelected() {
    const next = clearShopcaisseImportSelection();
    setSelectedIds(next.selectedIds);
    setImportMode(next.importMode);
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
      const previewImportableIds = payload.sampleItems
        .filter((item) => !item.alreadyImported && item.priceCents !== null)
        .map((item) => item.shopcaisseProductId);
      setSelectedIds((current) =>
        payload.success
          ? resolveShopcaissePreviewSelection({
              importMode,
              selectedIds: current,
              previewImportableIds,
            })
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
        body: JSON.stringify(
          buildShopcaisseImportPayload({
            importMode,
            selectedIds,
            selectedFamilies,
            publishByDefault,
          }),
        ),
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
    <section className="border border-[#ececef] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)] lg:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#bd6a45]">Import Shopcaisse</p>
          <h3 className="mt-2 text-[34px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Assistant d&apos;onboarding catalogue</h3>
          <p className="mt-3 max-w-3xl text-[13px] text-slate-500">
            Le parcours guide l&apos;administrateur depuis la connexion Shopcaisse jusqu&apos;a l&apos;import final, sans
            changer la logique metier existante.
          </p>
        </div>
        <div className="border border-[#ececef] bg-white px-4 py-3 text-[12px] text-slate-600 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
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

      <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        <span>Progression onboarding</span>
        <span>{currentStep}/6</span>
      </div>
      <ol className="mt-4 grid gap-3 lg:grid-cols-6">
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
                  "flex w-full items-center gap-3 border px-4 py-3 text-left transition",
                  active && "border-[#8b5cf6] bg-[#8b5cf6] text-white shadow-[0_8px_20px_rgba(139,92,246,0.35)]",
                  !active && complete && "border-[#22c55e] bg-[#22c55e] text-white",
                  !active && !complete && "border-[#ececef] bg-white text-slate-500",
                )}
              >
                <span className="text-2xl font-light leading-none">{step}</span>
                <span className="text-sm font-semibold">{title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8">
        {currentStep === 1 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">1. Connexion Shopcaisse</h4>
              <p className="mt-2 text-sm text-slate-500">
                Verifie la cle Shopcaisse, puis rafraichit le cache catalogue local avant toute selection.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="border border-[#ececef] bg-[#fafafa] p-5">
                <div className="flex items-center justify-between gap-4">
                  <strong>Statut de connexion</strong>
                  <span className={validation?.success ? "font-bold text-accent" : "font-bold text-slate-500"}>
                    {validation ? (validation.success ? "Valide" : "A verifier") : "Non verifie"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {validation?.message ?? "Aucune verification recente. Lance d'abord un test de connexion."}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Dernier test: {formatDateTime(validation?.checkedAt) ?? "Jamais"}
                </p>
                <button
                  type="button"
                  onClick={handleValidateConnection}
                  disabled={connectionLoading}
                  className="mt-5 bg-[#111] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {connectionLoading ? "Verification..." : "Tester la connexion"}
                </button>
              </article>

              <article className="border border-[#ececef] bg-[#fafafa] p-5">
                <div className="flex items-center justify-between gap-4">
                  <strong>Catalogue local</strong>
                  <span className={catalogSync?.success ? "font-bold text-accent" : "font-bold text-slate-500"}>
                    {catalogSync ? (catalogSync.success ? "Synchronise" : "A verifier") : "Pret a synchroniser"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {catalogSync
                    ? catalogSync.success
                      ? "Le cache local Prisma vient d'etre mis a jour."
                      : catalogSync.errors[0]?.message ?? "La synchronisation a echoue."
                    : "Synchronise le catalogue Shopcaisse pour rafraichir les familles et les produits importables."}
                </p>
                <div className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                  <div className="border border-[#ececef] p-3">Crees: {catalogSync?.createdCount ?? 0}</div>
                  <div className="border border-[#ececef] p-3">Mis a jour: {catalogSync?.updatedCount ?? 0}</div>
                  <div className="border border-[#ececef] p-3">Ignores: {catalogSync?.skippedCount ?? 0}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncCatalog}
                  disabled={syncLoading}
                  className="mt-5 border border-[#ececef] px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {syncLoading ? "Synchronisation..." : "Synchroniser le catalogue"}
                </button>
              </article>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="bg-[#111] px-5 py-3 text-sm font-semibold text-white"
              >
                Passer a la selection des familles
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">2. Selection des familles</h4>
              <p className="mt-2 text-sm text-slate-500">
                Choisis les familles a travailler. La previsualisation et l&apos;import se baseront sur cette selection.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <label className="text-sm font-semibold">
                Recherche par famille
                <input
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                  placeholder="Bijoux, luminaire, senteurs..."
                  className="mt-2 w-full border border-[#ececef] bg-white px-3 py-3"
                />
              </label>
              <label className="flex items-center gap-3 self-end border border-[#ececef] bg-[#fafafa] px-4 py-3 text-sm">
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
                      active ? "border-[#111] bg-[#111] text-white" : "border-[#ececef] bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <strong>{family.name}</strong>
                      <span className="text-xs font-semibold">{family.totalCount} produits</span>
                    </div>
                    <div className={cn("mt-4 grid gap-2 text-xs", active ? "text-white/90" : "text-slate-500")}>
                      <div>En stock: {family.inStockCount}</div>
                      <div>Sans stock: {family.outOfStockCount}</div>
                    </div>
                  </button>
                );
              })}
              {filteredFamilyStats.length === 0 ? (
                <div className="border border-[#ececef] bg-[#fafafa] p-4 text-sm text-slate-500">
                  Aucune famille ne correspond aux filtres actuels.
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border border-[#ececef] bg-[#fafafa] p-4 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <strong>{selectedFamilies.length}</strong> famille(s) selectionnee(s)
                <p className="mt-1 text-xs text-slate-500">
                  {selectedFamilies.length > 0 ? selectedFamilies.join(", ") : "Selectionne au moins une famille pour continuer."}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePreview(1)}
                  disabled={previewLoading || selectedFamilies.length === 0}
                  className="border border-[#ececef] px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {previewLoading ? "Actualisation..." : "Actualiser les familles choisies"}
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={selectedFamilies.length === 0}
                  className="bg-[#111] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
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
              <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">3. Strategie d&apos;import</h4>
              <p className="mt-2 text-sm text-slate-500">
                Choisis le mode d&apos;import deja supporte par le backend. Le mode brouillon reste recommande.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => setPublishByDefault(false)}
                className={cn(
                  "border p-5 text-left",
                  !publishByDefault ? "border-[#111] bg-[#111] text-white" : "border-[#ececef] bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>Importer en brouillon</strong>
                  <span className="text-xs font-semibold">Recommande</span>
                </div>
                <p className={cn("mt-3 text-sm", !publishByDefault ? "text-white/90" : "text-slate-500")}>
                  Les produits restent invisibles tant qu&apos;ils ne sont pas verifies dans le catalogue storefront.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPublishByDefault(true)}
                className={cn(
                  "border p-5 text-left",
                  publishByDefault ? "border-[#111] bg-[#111] text-white" : "border-[#ececef] bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>Importer et publier automatiquement</strong>
                  <span className="text-xs font-semibold">Non recommande</span>
                </div>
                <p className={cn("mt-3 text-sm", publishByDefault ? "text-white/90" : "text-slate-500")}>
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
                    importMode === mode ? "border-[#111] bg-[#111] text-white" : "border-[#ececef] bg-white",
                  )}
                >
                  <strong>{title}</strong>
                  <p className={cn("mt-2 text-sm", importMode === mode ? "text-white/90" : "text-slate-500")}>
                    {description}
                  </p>
                </button>
              ))}
            </div>

            <div className="border border-[#ececef] bg-[#fafafa] p-4 text-sm">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions((current) => !current)}
                className="font-bold"
              >
                {showAdvancedOptions ? "Masquer les options avancees" : "Afficher les options avancees"}
              </button>
              {showAdvancedOptions ? (
                <div className="mt-4 grid gap-3 text-sm text-slate-500">
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
                className="bg-[#111] px-5 py-3 text-sm font-semibold text-white"
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
                <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">4. Previsualisation</h4>
                <p className="mt-2 text-sm text-slate-500">
                  Controle le lot avant import. La pagination suit exactement le filtre courant.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm font-semibold">
                  Recherche produit
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nom, SKU, barcode"
                    className="mt-2 w-64 border border-[#ececef] bg-white px-3 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Produits par page
                  <select
                    value={previewLimit}
                    onChange={(event) => setPreviewLimit(Number(event.target.value) as (typeof PREVIEW_LIMIT_OPTIONS)[number])}
                    className="mt-2 border border-[#ececef] bg-white px-3 py-3"
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
                  className="border border-[#ececef] px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {previewLoading ? "Previsualisation..." : "Previsualiser les produits"}
                </button>
              </div>
            </header>

            {preview ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Produits trouves: {preview.totalCacheItems}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Produits importables: {preview.importableCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Deja presents: {preview.alreadyLinkedCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Sans prix: {preview.missingPriceCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Sans stock: {preview.missingStockCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Sans image: {preview.missingImageCount}</div>
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
                        "border px-3 py-2 text-xs font-semibold",
                        previewFilter === value ? "border-[#111] bg-[#111] text-white" : "border-[#ececef] bg-white",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <article className="border border-[#ececef] bg-[#fafafa] p-4 text-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <strong>Produits previsualises</strong>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-500">
                        Selection locale: {selectedIds.length} · Page {preview.page}/{preview.totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={clearSelected}
                        disabled={selectedIds.length === 0}
                        className="border border-[#ececef] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
                      >
                        Tout decocher
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                      <thead className="bg-[#f8f9fb] text-xs uppercase text-slate-500">
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
                              <tr key={item.shopcaisseProductId} className="border-t border-[#ececef]">
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
                                      className="h-14 w-14 rounded border border-[#ececef] object-cover"
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
                                    <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-[#ececef] text-[10px] text-slate-500">
                                      Aucune image
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="font-bold">{item.name}</div>
                                  <code className="text-xs text-slate-500">{item.shopcaisseProductId}</code>
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
                            <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                              Aucun produit ne correspond aux filtres visibles.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 border-t border-[#ececef] pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-slate-500">
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
                          className="border border-[#ececef] px-3 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          Page precedente
                        </button>
                      ) : null}
                      {getCompactPages(preview.page, preview.totalPages).map((pageNumber, index, compactPages) => {
                        const previousPage = compactPages[index - 1];
                        const showEllipsis = typeof previousPage === "number" && pageNumber - previousPage > 1;

                        return (
                          <div key={pageNumber} className="flex items-center gap-2">
                            {showEllipsis ? <span className="px-1 text-slate-400">…</span> : null}
                            <button
                              type="button"
                              onClick={() => handlePreview(pageNumber)}
                              disabled={previewLoading}
                              className={cn(
                                "border px-3 py-2 text-sm font-semibold disabled:opacity-60",
                                pageNumber === preview.page ? "border-[#111] bg-[#111] text-white" : "border-[#ececef]",
                              )}
                            >
                              {pageNumber}
                            </button>
                          </div>
                        );
                      })}
                      {preview.page < preview.totalPages ? (
                        <button
                          type="button"
                          onClick={() => handlePreview(preview.page + 1)}
                          disabled={previewLoading}
                          className="border border-[#ececef] px-3 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          Page suivante
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              </>
            ) : (
              <div className="border border-[#ececef] bg-[#fafafa] p-4 text-sm text-slate-500">
                Aucune previsualisation disponible pour le moment.
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(5)}
                disabled={
                  !canContinueToShopcaisseImportConfirmation(
                    preview?.success ?? false,
                    importMode,
                    selectedIds.length,
                  )
                }
                className="bg-[#111] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Continuer vers la confirmation
              </button>
            </div>
          </section>
        ) : null}

        {currentStep === 5 ? (
          <section className="grid gap-6">
            <header>
              <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">5. Confirmation</h4>
              <p className="mt-2 text-sm text-slate-500">
                Verifie une derniere fois le perimetre de l&apos;import avant de lancer l&apos;action.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="border border-[#ececef] bg-[#fafafa] p-5 text-sm">
                <strong>Resume d&apos;import</strong>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span>Mode choisi</span>
                    <strong>{getImportModeLabel(importMode)}</strong>
                  </div>
                  {importMode !== "selected" ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>Familles concernees</span>
                      <strong>{selectedFamilies.length > 0 ? selectedFamilies.join(", ") : "Toutes les familles"}</strong>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4">
                    <span>Statut final</span>
                    <strong>{publishByDefault ? "Publie" : "Brouillon"}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>{importMode === "selected" ? "Produits selectionnes" : "Produits vises"}</span>
                    <strong>{estimatedImportCount}</strong>
                  </div>
                </div>
              </article>

              <article className="border border-[#ececef] bg-[#fafafa] p-5 text-sm">
                <strong>Regles d&apos;exclusion</strong>
                <ul className="mt-4 grid gap-2 text-slate-500">
                  <li>Les produits sans prix restent ignores par la logique actuelle.</li>
                  <li>Les produits deja lies ne sont pas recrées en doublon.</li>
                  <li>Les familles non selectionnees restent hors perimetre.</li>
                  <li>Les images restent optionnelles et sont traitees a part si necessaire.</li>
                </ul>
              </article>
            </div>

            {publishByDefault ? (
              <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                La publication automatique est activee. Verifie attentivement la previsualisation avant de confirmer.
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={importLoading || estimatedImportCount === 0}
                className="bg-[#111] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
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
              <h4 className="text-[30px] font-[200] leading-none tracking-[-0.04em] text-[#111]">6. Resultat</h4>
              <p className="mt-2 text-sm text-slate-500">Le resultat reprend la reponse reelle du backend, sans changer la logique d&apos;import existante.</p>
            </header>

            {importResult ? (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Importes: {importResult.createdCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Lies: {importResult.linkedCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Ignores: {importResult.skippedCount}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Erreurs: {importResult.errors.length}</div>
                  <div className="border border-[#ececef] bg-[#fafafa] p-4">Sans image: {preview?.missingImageCount ?? 0}</div>
                </div>

                <article className="border border-[#ececef] bg-[#fafafa] p-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <strong className={importResult.success ? "text-accent" : "text-rose-600"}>
                      {importResult.success ? "Import termine" : "Import partiel ou en echec"}
                    </strong>
                    <span>{formatDateTime(importResult.importedAt)}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {importResult.errors.length > 0 ? (
                      importResult.errors.slice(0, 10).map((error) => (
                        <div key={`${error.shopcaisseProductId}:${error.message}`} className="border border-[#ececef] p-3 text-slate-500">
                          <code>{error.shopcaisseProductId}</code> {error.message}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">Aucune erreur remontee par le backend.</p>
                    )}
                  </div>
                </article>
              </>
            ) : (
              <div className="border border-[#ececef] bg-[#fafafa] p-4 text-sm text-slate-500">
                Aucun import n&apos;a encore ete lance dans cette session.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a href="/admin/products" className="border border-[#ececef] px-4 py-3 text-sm font-semibold">
                Voir les produits importes
              </a>
              <a href="/admin/products/missing-images" className="border border-[#ececef] px-4 py-3 text-sm font-semibold">
                Voir les produits sans image
              </a>
              <button
                type="button"
                onClick={() => {
                  void handlePreview(1);
                  goToStep(4);
                }}
                className="border border-[#ececef] px-4 py-3 text-sm font-semibold"
              >
                Relancer une previsualisation
              </button>
            </div>
          </section>
        ) : null}

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <article className="border border-[#ececef] bg-[#fafafa] p-4">
            <strong>Dernier succes import</strong>
            <p className="mt-2 text-slate-500">
              {lastImportSuccessAt ? formatDateTime(lastImportSuccessAt) : "Aucun import storefront reussi."}
            </p>
          </article>
          <article className="border border-[#ececef] bg-[#fafafa] p-4">
            <strong>Derniere erreur import</strong>
            <p className="mt-2 text-slate-500">{lastImportErrorMessage ?? "Aucune erreur import enregistree."}</p>
          </article>
          <article className="border border-[#ececef] bg-[#fafafa] p-4">
            <strong>Dernier succes catalogue</strong>
            <p className="mt-2 text-slate-500">
              {lastCatalogSuccessAt ? formatDateTime(lastCatalogSuccessAt) : "Aucun succes catalogue enregistre."}
            </p>
          </article>
          <article className="border border-[#ececef] bg-[#fafafa] p-4">
            <strong>Derniere erreur catalogue</strong>
            <p className="mt-2 text-slate-500">{lastCatalogErrorMessage ?? "Aucune erreur catalogue enregistree."}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
