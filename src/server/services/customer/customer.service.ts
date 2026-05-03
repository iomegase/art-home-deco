import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/server/db/client";

type CustomerDbClient = PrismaClient | Prisma.TransactionClient;

export async function findOrCreateCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  client?: CustomerDbClient;
}) {
  const client = input.client ?? db;

  return client.customer.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
    },
    create: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
    },
  });
}
