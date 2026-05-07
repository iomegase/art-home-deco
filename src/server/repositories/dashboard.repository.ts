import { db, isDatabaseUnavailableError } from "@/server/db/client";
import { getGoogleAnalyticsSnapshot, getSearchConsoleSnapshot } from "@/server/services/google-reporting.service";

export async function getAdminDashboardSnapshot() {
  try {
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
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.warn("Admin dashboard snapshot unavailable because the database is unreachable.");
      return {
        productCount: 0,
        orderCount: 0,
        blogPostCount: 0,
        paidOrders: 0,
        recentEvents: [],
      };
    }

    throw error;
  }
}

export async function getAdminAnalyticsSnapshot() {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);
  const startDate = periodStart.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  try {
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
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.warn("Admin analytics snapshot unavailable because the database is unreachable.");
      return {
        periodStart,
        periodEnd: now,
        paidOrders30d: 0,
        checkoutStarted30d: 0,
        checkoutToPaidConversion: 0,
        revenue30dCents: 0,
        ordersByShippingMethod: [],
        eventsByProvider: [],
        eventsByType: [],
        googleAnalytics: {
          status: "error" as const,
          error: "Database unavailable while building the admin analytics snapshot.",
        },
        searchConsole: {
          status: "error" as const,
          error: "Database unavailable while building the admin analytics snapshot.",
        },
      };
    }

    throw error;
  }
}
