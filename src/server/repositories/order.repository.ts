import { db } from "@/server/db/client";

export type AdminOrderListItem = Awaited<ReturnType<typeof listOrdersForAdmin>>[number];
export type AdminOrderDetails = NonNullable<Awaited<ReturnType<typeof findOrderForAdmin>>>;

export async function listOrdersForAdmin() {
  return db.order.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOrderForAdmin(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
}

export async function findOrderByStripeSessionId(stripeSessionId: string) {
  return db.order.findUnique({
    where: { stripeSessionId },
    include: {
      items: true,
    },
  });
}

export async function updateOrderFulfillment(input: {
  id: string;
  orderStatus: string;
  trackingNumber?: string;
}) {
  return db.order.update({
    where: { id: input.id },
    data: {
      orderStatus: input.orderStatus,
      trackingNumber: input.trackingNumber || null,
    },
    include: {
      items: true,
    },
  });
}
