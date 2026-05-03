import { db } from "@/server/db/client";

export type AdminOrderListItem = Awaited<ReturnType<typeof listOrdersForAdmin>>[number];
export type AdminOrderDetails = NonNullable<Awaited<ReturnType<typeof findOrderForAdmin>>>;

export async function listOrdersForAdmin() {
  return db.order.findMany({
    include: {
      items: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOrderForAdmin(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
    },
  });
}

export async function findOrderByStripeSessionId(stripeSessionId: string) {
  return db.order.findUnique({
    where: { stripeSessionId },
    include: {
      items: true,
      customer: true,
    },
  });
}

export async function updateOrderFulfillment(input: {
  id: string;
  orderStatus: string;
  trackingNumber?: string;
  carrier?: string;
  labelUrl?: string;
}) {
  const now = new Date();
  return db.order.update({
    where: { id: input.id },
    data: {
      orderStatus: input.orderStatus,
      trackingNumber: input.trackingNumber || null,
      carrier: input.carrier || null,
      labelUrl: input.labelUrl || null,
      labelGeneratedAt: input.labelUrl ? now : null,
      shippedAt: input.orderStatus === "shipped" ? now : undefined,
      deliveredAt: input.orderStatus === "delivered" ? now : undefined,
    },
    include: {
      items: true,
      customer: true,
    },
  });
}
