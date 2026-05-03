import { db } from "@/server/db/client";

export async function listCustomersAdmin() {
  const customers = await db.customer.findMany({
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return customers.map((customer) => ({
    ...customer,
    orderCount: customer.orders.length,
    totalSpentCents: customer.orders.reduce((sum, order) => sum + order.totalCents, 0),
    lastOrderAt: customer.orders[0]?.createdAt ?? null,
  }));
}

export async function getCustomerAdmin(id: string) {
  return db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });
}
