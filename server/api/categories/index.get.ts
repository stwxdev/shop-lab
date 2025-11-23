import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return categories
})
