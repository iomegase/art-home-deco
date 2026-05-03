"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { renderOrderShippedEmail } from "@/emails/templates/order-status-update";
import { findOrderForAdmin, updateOrderFulfillment } from "@/server/repositories/order.repository";
import { requireAdmin } from "@/server/security/auth";
import { sendTransactionalEmail } from "@/server/services/email.service";

const fulfillmentSchema = z.object({
  id: z.string().min(1),
  orderStatus: z.enum([
    "pending",
    "paid",
    "validated",
    "label_ready",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  labelUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateOrderFulfillmentAction(formData: FormData) {
  await requireAdmin();

  const parsed = fulfillmentSchema.parse({
    id: String(formData.get("id") ?? ""),
    orderStatus: String(formData.get("orderStatus") ?? ""),
    trackingNumber: String(formData.get("trackingNumber") ?? ""),
    carrier: String(formData.get("carrier") ?? ""),
    labelUrl: String(formData.get("labelUrl") ?? ""),
  });

  const existingOrder = await findOrderForAdmin(parsed.id);

  if (!existingOrder) {
    throw new Error("Commande introuvable.");
  }

  if (parsed.orderStatus === "shipped" && existingOrder.shippingMethod !== "pickup" && !parsed.trackingNumber) {
    throw new Error("Un numero de suivi est requis pour marquer une commande expediee.");
  }

  const updatedOrder = await updateOrderFulfillment(parsed);

  if (existingOrder.orderStatus !== updatedOrder.orderStatus) {
    if (updatedOrder.orderStatus === "shipped") {
      await sendTransactionalEmail({
        to: updatedOrder.customerEmail,
        subject: `Commande ${updatedOrder.orderNumber} expediee`,
        html: renderOrderShippedEmail({
          orderNumber: updatedOrder.orderNumber,
          customerFirstName: updatedOrder.customerFirstName,
          trackingNumber: updatedOrder.trackingNumber,
        }),
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.id}`);
  if (updatedOrder.trackingToken) {
    revalidatePath(`/commande/suivi/${updatedOrder.trackingToken}`);
  }
  redirect(`/admin/orders/${parsed.id}`);
}
