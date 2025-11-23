import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  await requireRole(event, 'WAREHOUSE')
  
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: 'PROCESSED'
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })

  return order
})
