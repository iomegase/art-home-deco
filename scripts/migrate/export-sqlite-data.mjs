import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const projectRoot = process.cwd();
const defaultSqlitePath = path.join(projectRoot, "prisma", "dev.db");
const sqlitePath = process.env.SQLITE_DATABASE_PATH
  ? path.resolve(projectRoot, process.env.SQLITE_DATABASE_PATH)
  : defaultSqlitePath;
const outputPath = path.join(projectRoot, "scripts", "migrate", "sqlite-export.json");

const tableConfigs = {
  categories: {
    table: "Category",
    dates: ["createdAt", "updatedAt"],
  },
  products: {
    table: "Product",
    booleans: ["isFragile", "pickupOnly"],
    dates: ["lastStockSyncAt", "createdAt", "updatedAt"],
  },
  productImages: {
    table: "ProductImage",
  },
  productCategories: {
    table: "ProductCategory",
  },
  blogPosts: {
    table: "BlogPost",
    booleans: ["generatedWithAI", "reviewedByHuman"],
    dates: ["publishedAt", "createdAt", "updatedAt"],
  },
  orders: {
    table: "\"Order\"",
    dates: [
      "shopcaisseSyncAt",
      "stockDecrementedAt",
      "createdAt",
      "updatedAt",
    ],
  },
  orderItems: {
    table: "OrderItem",
  },
  integrationEvents: {
    table: "IntegrationEvent",
    dates: ["createdAt"],
  },
};

function normalizeValue(key, value, config) {
  if (value == null) {
    return null;
  }

  if (config.booleans?.includes(key)) {
    return Boolean(value);
  }

  if (config.dates?.includes(key)) {
    if (typeof value === "number") {
      return new Date(value).toISOString();
    }

    return new Date(value).toISOString();
  }

  return value;
}

function normalizeRow(row, config) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(key, value, config)]),
  );
}

async function main() {
  const db = new DatabaseSync(sqlitePath, { readOnly: true });

  const snapshot = Object.fromEntries(
    Object.entries(tableConfigs).map(([key, config]) => {
      const rows = db
        .prepare(`SELECT * FROM ${config.table}`)
        .all()
        .map((row) => normalizeRow(row, config));

      return [key, rows];
    }),
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const counts = Object.fromEntries(
    Object.entries(snapshot).map(([key, rows]) => [key, rows.length]),
  );

  console.log(JSON.stringify({ sqlitePath, outputPath, counts }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
