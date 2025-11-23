import prisma from "#shared/prisma";

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true
    }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      message: 'Product not found'
    })
  }

  return product
})
