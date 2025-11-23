import { z } from 'zod'
import prisma from "#shared/prisma";

const productSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.number().int().optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'MANAGER')
  
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)
  const data = productSchema.parse(body)

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true
    }
  })

  return product
})
