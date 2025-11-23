import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined

  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId } : {},
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return products
})
