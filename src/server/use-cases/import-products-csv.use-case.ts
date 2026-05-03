import { productImportRowSchema, type ProductImportInput } from "@/schemas/forms/product-import.schema";
import { slugify } from "@/lib/slugify";
import { upsertImportedProduct } from "@/server/repositories/admin-product.repository";

type ImportSummary = {
  totalRows: number;
  created: number;
  updated: number;
  errors: Array<{
    rowNumber: number;
    message: string;
    sku?: string;
    title?: string;
  }>;
};

function normalizeHeader(value: string) {
  return slugify(value).replace(/-/g, "");
}

function detectDelimiter(headerLine: string) {
  const candidates = [",", ";", "\t"];
  const scored = candidates.map((delimiter) => ({
    delimiter,
    count: headerLine.split(delimiter).length,
  }));

  return scored.sort((left, right) => right.count - left.count)[0]?.delimiter ?? ",";
}

function parseCsv(content: string) {
  const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentField += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((value) => value.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  if (!rows.length) {
    return [];
  }

  return rows;
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "oui", "yes"].includes(value.trim().toLowerCase());
}

function parseCategories(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInteger(value: string | undefined, fallback = 0) {
  if (!value || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export async function importProductsCsvUseCase(input: ProductImportInput): Promise<ImportSummary> {
  const parsedRows = parseCsv(input.csvContent);

  if (parsedRows.length < 2) {
    throw new Error("Le CSV doit contenir un en-tete et au moins une ligne.");
  }

  const [headerRow, ...dataRows] = parsedRows;
  const headerMap = headerRow.map((header) => normalizeHeader(header));

  const summary: ImportSummary = {
    totalRows: dataRows.length,
    created: 0,
    updated: 0,
    errors: [],
  };

  for (const [rowIndex, row] of dataRows.entries()) {
    const values = Object.fromEntries(
      headerMap.map((header, index) => [header, row[index]?.trim() ?? ""]),
    );

    try {
      const payload = productImportRowSchema.parse({
        title: values.title,
        slug: values.slug || undefined,
        sku: values.sku,
        barcode: values.barcode || undefined,
        externalStockId: values.externalstockid || undefined,
        priceCents: parseInteger(values.pricecents),
        stock: parseInteger(values.stock),
        shippingClass: values.shippingclass || "M",
        status: values.status || "draft",
        shortDescription: values.shortdescription || undefined,
        description: values.description || undefined,
        categorySlugs: parseCategories(values.categories || values.category),
        imageUrl: values.imageurl || undefined,
        imageAlt: values.imagealt || undefined,
        pickupOnly: parseBoolean(values.pickuponly),
        estimatedWeightGrams: parseInteger(values.estimatedweightgrams),
        isFragile: parseBoolean(values.isfragile),
        seoTitle: values.seotitle || undefined,
        seoDescription: values.seodescription || undefined,
      });

      const result = await upsertImportedProduct(payload);
      if (result.updated) {
        summary.updated += 1;
      } else {
        summary.created += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      summary.errors.push({
        rowNumber: rowIndex + 2,
        message,
        sku: values.sku || undefined,
        title: values.title || undefined,
      });
    }
  }

  return summary;
}
