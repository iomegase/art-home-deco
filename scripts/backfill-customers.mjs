import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function createTrackingToken() {
  return randomBytes(24).toString("base64url");
}

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: null }, { trackingToken: null }],
    },
    orderBy: { createdAt: "asc" },
  });

  for (const order of orders) {
    const customer = await prisma.customer.upsert({
      where: { email: order.customerEmail },
      update: {
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        phone: order.customerPhone || null,
      },
      create: {
        email: order.customerEmail,
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        phone: order.customerPhone || null,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerId: order.customerId ?? customer.id,
        trackingToken: order.trackingToken ?? createTrackingToken(),
      },
    });
  }

  console.log(JSON.stringify({ updatedOrders: orders.length }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
