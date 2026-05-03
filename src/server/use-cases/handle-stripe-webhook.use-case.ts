import type Stripe from "stripe";
import { renderAdminNewOrderEmail } from "@/emails/templates/admin-new-order";
import { renderOrderConfirmationEmail } from "@/emails/templates/order-confirmation";
import { logger } from "@/lib/logger";
import { db } from "@/server/db/client";
import { getEnv } from "@/server/env";
import { sendTransactionalEmail } from "@/server/services/email.service";
import { pushShopcaisseStockMovement } from "@/server/services/shopcaisse/movements";

type PaidOrderEmailData = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  totalCents: number;
  shippingMethod: string;
  items: Array<{ title: string; quantity: number; lineTotalCents: number }>;
  movementItems: Array<{ sku: string; quantity: number }>;
};

async function markOrderPaidFromStripeSession(session: Stripe.Checkout.Session, orderId: string) {
  return db.$transaction<PaidOrderEmailData | null>(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.paymentStatus === "paid" || order.stockDecrementedAt) {
      return null;
    }

    for (const item of order.items) {
      if (!item.productId) {
        continue;
      }

      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour ${item.title}.`);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        orderStatus: "paid",
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        stockDecrementedAt: new Date(),
      },
      include: { items: true },
    });

    return {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerEmail: updatedOrder.customerEmail,
      customerFirstName: updatedOrder.customerFirstName,
      customerLastName: updatedOrder.customerLastName,
      totalCents: updatedOrder.totalCents,
      shippingMethod: updatedOrder.shippingMethod,
      items: updatedOrder.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        lineTotalCents: item.lineTotalCents,
      })),
      movementItems: updatedOrder.items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      })),
    };
  });
}

export async function handleStripeWebhookUseCase(event: Stripe.Event) {
  const env = getEnv();

  if (event.type !== "checkout.session.completed") {
    return { handled: false };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw new Error("Stripe session missing orderId metadata.");
  }

  const paidOrder = await markOrderPaidFromStripeSession(session, orderId);

  if (paidOrder) {
    try {
      const movement = await pushShopcaisseStockMovement({
        orderId: paidOrder.orderId,
        orderNumber: paidOrder.orderNumber,
        items: paidOrder.movementItems,
      });

      await db.order.update({
        where: { id: paidOrder.orderId },
        data: {
          shopcaisseSyncStatus: movement.pushed ? "success" : "pending",
          shopcaisseSyncAt: movement.pushed ? new Date() : null,
          shopcaisseSyncError: null,
        },
      });
    } catch (error) {
      await db.order.update({
        where: { id: paidOrder.orderId },
        data: {
          shopcaisseSyncStatus: "failed",
          shopcaisseSyncAt: new Date(),
          shopcaisseSyncError: error instanceof Error ? error.message : "Shopcaisse sync failed.",
        },
      });
    }

    try {
      await sendTransactionalEmail({
        to: paidOrder.customerEmail,
        subject: `Commande ${paidOrder.orderNumber} confirmee`,
        html: renderOrderConfirmationEmail(paidOrder),
      });
    } catch (error) {
      await logger.integration("error", {
        provider: "resend",
        eventType: "order_confirmation_email",
        status: "failed",
        targetType: "order",
        targetId: paidOrder.orderId,
        message: error instanceof Error ? error.message : "Email client impossible a envoyer.",
      });
    }

    if (env.ADMIN_ORDER_EMAIL) {
      try {
        await sendTransactionalEmail({
          to: env.ADMIN_ORDER_EMAIL,
          subject: `Nouvelle commande ${paidOrder.orderNumber}`,
          html: renderAdminNewOrderEmail(paidOrder),
        });
      } catch (error) {
        await logger.integration("error", {
          provider: "resend",
          eventType: "admin_new_order_email",
          status: "failed",
          targetType: "order",
          targetId: paidOrder.orderId,
          message: error instanceof Error ? error.message : "Email boutique impossible a envoyer.",
        });
      }
    }
  }

  return { handled: true };
}
