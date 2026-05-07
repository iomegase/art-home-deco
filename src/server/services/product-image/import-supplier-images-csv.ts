import { db } from "@/server/db/client";
import { importProductImageFromUrl, validateExternalImageUrl } from "./import-product-image-from-url";

type SupplierCsvRow = {
  barcode: string;
  sku: string;
  name: string;
  imageUrl: string;
  image2Url: string;
  image3Url: string;
  alt: string;
  source: string;
  license: string;
};

type SupplierCsvPreviewRow = {
  rowNumber: number;
  barcode: string;
  sku: string;
  name: string;
  matchedProductId: string | null;
  matchedProductTitle: string | null;
  matchedBy: "barcode" | "sku" | null;
  imageUrls: string[];
  invalidImageUrls: string[];
  license: string;
  canApply: boolean;
  message: string;
};

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseSupplierCsv(csvContent: string) {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV fournisseur vide ou incomplet.");
  }

  const headers = parseCsvLine(lines[0]).map((value) => value.trim().toLowerCase());
  const requiredHeaders = ["barcode", "sku", "name", "image_url", "alt", "source", "license"];

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      throw new Error(`Colonne CSV manquante: ${header}`);
    }
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const rowRecord = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex] ?? ""]));

    return {
      rowNumber: index + 2,
      barcode: rowRecord.barcode ?? "",
      sku: rowRecord.sku ?? "",
      name: rowRecord.name ?? "",
      imageUrl: rowRecord.image_url ?? "",
      image2Url: rowRecord.image_2_url ?? "",
      image3Url: rowRecord.image_3_url ?? "",
      alt: rowRecord.alt ?? "",
      source: rowRecord.source ?? "",
      license: rowRecord.license ?? "",
    } satisfies SupplierCsvRow & { rowNumber: number };
  });
}

async function matchProducts(rows: Array<SupplierCsvRow & { rowNumber: number }>) {
  const barcodes = rows.map((row) => row.barcode).filter(Boolean);
  const skus = rows.map((row) => row.sku).filter(Boolean);

  const products = await db.product.findMany({
    where: {
      OR: [
        ...(barcodes.length > 0 ? [{ barcode: { in: barcodes } }] : []),
        ...(skus.length > 0 ? [{ sku: { in: skus } }] : []),
      ],
    },
    include: { images: true },
  });

  const byBarcode = new Map(products.filter((product) => product.barcode).map((product) => [product.barcode as string, product]));
  const bySku = new Map(products.map((product) => [product.sku, product]));

  return { byBarcode, bySku };
}

export async function previewSupplierImagesCsv(csvContent: string) {
  const rows = parseSupplierCsv(csvContent);
  const { byBarcode, bySku } = await matchProducts(rows);

  const previewRows: SupplierCsvPreviewRow[] = rows.map((row) => {
    const imageUrls = [row.imageUrl, row.image2Url, row.image3Url].filter(Boolean);
    const validImageUrls: string[] = [];
    const invalidImageUrls: string[] = [];

    for (const imageUrl of imageUrls) {
      try {
        validImageUrls.push(validateExternalImageUrl(imageUrl).toString());
      } catch {
        invalidImageUrls.push(imageUrl);
      }
    }

    const matchedProduct = (row.barcode ? byBarcode.get(row.barcode) : undefined) ?? (row.sku ? bySku.get(row.sku) : undefined) ?? null;
    const matchedBy = matchedProduct ? (row.barcode && byBarcode.get(row.barcode)?.id === matchedProduct.id ? "barcode" : "sku") : null;
    const license = row.license.trim().toLowerCase();
    const canApply = Boolean(matchedProduct) && validImageUrls.length > 0 && license === "authorized" && (matchedProduct?.images.length ?? 0) === 0;

    let message = "Pret a verifier.";
    if (!matchedProduct) {
      message = "Aucun produit reconnu.";
    } else if ((matchedProduct.images.length ?? 0) > 0) {
      message = "Produit deja image, import CSV ignore par securite anti-doublon.";
    } else if (validImageUrls.length === 0) {
      message = "Aucune URL image valide.";
    } else if (license !== "authorized") {
      message = "Licence non autorisee, verification humaine requise.";
    }

    return {
      rowNumber: row.rowNumber,
      barcode: row.barcode,
      sku: row.sku,
      name: row.name,
      matchedProductId: matchedProduct?.id ?? null,
      matchedProductTitle: matchedProduct?.title ?? null,
      matchedBy,
      imageUrls: validImageUrls,
      invalidImageUrls,
      license: row.license,
      canApply,
      message,
    };
  });

  return {
    totalRows: previewRows.length,
    recognizedRows: previewRows.filter((row) => row.matchedProductId).length,
    unrecognizedRows: previewRows.filter((row) => !row.matchedProductId).length,
    invalidUrlRows: previewRows.filter((row) => row.invalidImageUrls.length > 0).length,
    applicableRows: previewRows.filter((row) => row.canApply).length,
    rows: previewRows,
  };
}

export async function applySupplierImagesCsv(csvContent: string) {
  const preview = await previewSupplierImagesCsv(csvContent);
  const errors: Array<{ rowNumber: number; message: string }> = [];
  let appliedCount = 0;
  let skippedCount = 0;

  for (const row of preview.rows) {
    if (!row.canApply || !row.matchedProductId) {
      skippedCount += 1;
      continue;
    }

    try {
      for (const [index, imageUrl] of row.imageUrls.entries()) {
        await importProductImageFromUrl({
          productId: row.matchedProductId,
          imageUrl,
          alt: row.name,
          source: "supplier_csv",
          markValidated: false,
        });

        if (index >= 2) {
          break;
        }
      }
      appliedCount += 1;
    } catch (error) {
      skippedCount += 1;
      if (errors.length < 10) {
        errors.push({
          rowNumber: row.rowNumber,
          message: error instanceof Error ? error.message : "Erreur import image fournisseur.",
        });
      }
    }
  }

  return {
    appliedCount,
    skippedCount,
    errors,
    preview,
  };
}
