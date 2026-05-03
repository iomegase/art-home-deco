import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, "scripts", "migrate", "sqlite-export.json");
const prisma = new PrismaClient();

const dateFields = {
  categories: ["createdAt", "updatedAt"],
  products: ["lastStockSyncAt", "createdAt", "updatedAt"],
  blogPosts: ["publishedAt", "createdAt", "updatedAt"],
  orders: ["shopcaisseSyncAt", "stockDecrementedAt", "createdAt", "updatedAt"],
  integrationEvents: ["createdAt"],
};

function reviveDates(rows, fields = []) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (value == null || !fields.includes(key)) {
          return [key, value];
        }

        return [key, new Date(value)];
      }),
    ),
  );
}

async function assertTargetIsEmpty() {
  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productCategories: await prisma.productCategory.count(),
    blogPosts: await prisma.blogPost.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    integrationEvents: await prisma.integrationEvent.count(),
  };

  const nonEmpty = Object.entries(counts).filter(([, count]) => count > 0);

  if (nonEmpty.length > 0) {
    throw new Error(
      `Target database is not empty: ${nonEmpty
        .map(([table, count]) => `${table}=${count}`)
        .join(", ")}`,
    );
  }
}

async function main() {
  await assertTargetIsEmpty();

  const raw = await readFile(inputPath, "utf8");
  const snapshot = JSON.parse(raw);

  await prisma.category.createMany({
    data: reviveDates(snapshot.categories, dateFields.categories),
  });
  await prisma.product.createMany({
    data: reviveDates(snapshot.products, dateFields.products),
  });
  await prisma.productImage.createMany({
    data: snapshot.productImages,
  });
  await prisma.productCategory.createMany({
    data: snapshot.productCategories,
  });
  await prisma.blogPost.createMany({
    data: reviveDates(snapshot.blogPosts, dateFields.blogPosts),
  });
  await prisma.order.createMany({
    data: reviveDates(snapshot.orders, dateFields.orders),
  });
  await prisma.orderItem.createMany({
    data: snapshot.orderItems,
  });
  await prisma.integrationEvent.createMany({
    data: reviveDates(snapshot.integrationEvents, dateFields.integrationEvents),
  });

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productCategories: await prisma.productCategory.count(),
    blogPosts: await prisma.blogPost.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    integrationEvents: await prisma.integrationEvent.count(),
  };

  console.log(JSON.stringify({ inputPath, counts }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
