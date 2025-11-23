import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  await requireRole(event, 'MANAGER')
  
  const id = parseInt(getRouterParam(event, 'id') || '0')

  await prisma.product.delete({
    where: { id }
  })

  return { success: true }
})
