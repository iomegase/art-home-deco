import { db } from "@/server/db/client";
import { getGoogleAnalyticsSnapshot, getSearchConsoleSnapshot } from "@/server/services/google-reporting.service";

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

export async function getAdminAnalyticsSnapshot() {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);
  const startDate = periodStart.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  const [
    paidOrders30d,
    checkoutStarted30d,
    totalRevenue30d,
    ordersByShippingMethod,
    eventsByProvider,
    eventsByType,
    googleAnalytics,
    searchConsole,
  ] = await Promise.all([
    db.order.count({
      where: {
        paymentStatus: "paid",
        createdAt: { gte: periodStart },
      },
    }),
    db.order.count({
      where: {
        createdAt: { gte: periodStart },
      },
    }),
    db.order.aggregate({
      where: {
        paymentStatus: "paid",
        createdAt: { gte: periodStart },
      },
      _sum: {
        totalCents: true,
      },
    }),
    db.order.groupBy({
      by: ["shippingMethod"],
      where: {
        createdAt: { gte: periodStart },
      },
      _count: {
        _all: true,
      },
    }),
    db.integrationEvent.groupBy({
      by: ["provider"],
      where: {
        createdAt: { gte: periodStart },
      },
      _count: {
        _all: true,
      },
    }),
    db.integrationEvent.groupBy({
      by: ["eventType"],
      where: {
        createdAt: { gte: periodStart },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          eventType: "desc",
        },
      },
      take: 12,
    }),
    getGoogleAnalyticsSnapshot(startDate, endDate),
    getSearchConsoleSnapshot(startDate, endDate),
  ]);

  const checkoutToPaidConversion = checkoutStarted30d > 0 ? (paidOrders30d / checkoutStarted30d) * 100 : 0;

  return {
    periodStart,
    periodEnd: now,
    paidOrders30d,
    checkoutStarted30d,
    checkoutToPaidConversion,
    revenue30dCents: totalRevenue30d._sum.totalCents ?? 0,
    ordersByShippingMethod,
    eventsByProvider,
    eventsByType,
    googleAnalytics,
    searchConsole,
  };
}
