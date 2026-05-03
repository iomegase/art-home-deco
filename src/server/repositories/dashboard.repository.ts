import { db } from "@/server/db/client";

export async function getAdminDashboardSnapshot() {
  const [productCount, orderCount, blogPostCount, paidOrders, recentEvents] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.blogPost.count(),
    db.order.count({
      where: {
        paymentStatus: "paid",
      },
    }),
    db.integrationEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    productCount,
    orderCount,
    blogPostCount,
    paidOrders,
    recentEvents,
  };
}
