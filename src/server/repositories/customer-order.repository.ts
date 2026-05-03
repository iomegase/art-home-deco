import { db } from "@/server/db/client";

export async function getOrderByTrackingToken(token: string) {
  return db.order.findUnique({
    where: { trackingToken: token },
    include: {
      items: true,
      customer: true,
    },
  });
}
