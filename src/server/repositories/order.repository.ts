import { db } from "@/server/db/client";
import type { Prisma } from "@prisma/client";

export type AdminOrderListItem = Awaited<ReturnType<typeof listOrdersForAdmin>>[number];
export type AdminOrderDetails = NonNullable<Awaited<ReturnType<typeof findOrderForAdmin>>>;
export type ColishipExportOrder = Awaited<ReturnType<typeof listOrdersReadyForColishipExport>>[number];
type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;
export type PurchaseAnalyticsTrackResult = { tracked: false } | { tracked: true; order: OrderWithItems };

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
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
  });
}

export async function listOrdersReadyForColishipExport() {
  return db.order.findMany({
    where: {
      paymentStatus: "paid",
      orderStatus: {
        notIn: ["cancelled", "shipped", "delivered"],
      },
      shippingMethod: {
        in: ["colissimo_home", "colissimo_pickup"],
      },
      shippingAddressLine1: { not: null },
      shippingPostalCode: { not: null },
      shippingCity: { not: null },
      shippingCountry: { not: null },
      items: {
        some: {},
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
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

export async function markPurchaseAnalyticsTracked(stripeSessionId: string): Promise<PurchaseAnalyticsTrackResult> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { stripeSessionId },
      include: {
        items: true,
      },
    });

    if (!order || order.paymentStatus !== "paid" || order.analyticsPurchaseTrackedAt) {
      return { tracked: false as const };
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        analyticsPurchaseTrackedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    return {
      tracked: true as const,
      order: updated,
    };
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
