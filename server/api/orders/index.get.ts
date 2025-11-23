import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  await requireRole(event, 'WAREHOUSE')
  
  const orders = await prisma.order.findMany({
    where: {
      status: 'NEW'
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return orders
})
