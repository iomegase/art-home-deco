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

export function isDatabaseUnavailableError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError
    || error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    const message = error.message;
    return (
      message.includes("Can't reach database server")
      || message.includes("P1001")
      || message.includes("P1017")
      || message.includes("Connection terminated unexpectedly")
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Can't reach database server")
    || message.includes("Connection terminated unexpectedly")
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

function supportsShopcaisseCatalogCache(client: AppPrismaClient | undefined) {
  return typeof client?.shopcaisseProductCache?.findMany === "function";
}

function resolvePrismaClient() {
  if (process.env.NODE_ENV === "production") {
    return globalForPrisma.prisma ?? createPrismaClient();
  }

  if (!globalForPrisma.prisma || !supportsShopcaisseCatalogCache(globalForPrisma.prisma)) {
    if (globalForPrisma.prisma && !supportsShopcaisseCatalogCache(globalForPrisma.prisma)) {
      console.warn("Recreating Prisma client to pick up newly generated model delegates.");
    }

    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export function getDbClient() {
  return resolvePrismaClient();
}

export const db = new Proxy({} as AppPrismaClient, {
  get(_target, prop) {
    const client = resolvePrismaClient();
    return client[prop as keyof AppPrismaClient];
  },
});
