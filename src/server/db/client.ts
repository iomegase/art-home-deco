import { Prisma, PrismaClient } from "@prisma/client";

const readOperations = new Set([
  "aggregate",
  "count",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "groupBy",
]);

function isTransientDatabaseDisconnect(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P1001", "P1017"].includes(error.code)
  ) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("E57P01") ||
    message.includes("SqlState(E57P01)") ||
    message.includes("terminating connection due to administrator command")
  );
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (!readOperations.has(operation) || !isTransientDatabaseDisconnect(error)) {
              throw error;
            }

            console.warn("Retrying Prisma read after transient database disconnect", {
              operation,
            });
            return query(args);
          }
        },
      },
    },
  });
}

type AppPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: AppPrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
