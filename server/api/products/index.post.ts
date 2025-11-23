import { z } from 'zod'
import prisma from "#shared/prisma";

const productSchema = z.object({
  name: z.string().min(1),
  categoryId: z.number().int(),
  price: z.number().positive(),
  image: z.string().url(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'MANAGER')
  
  const body = await readBody(event)
  const data = productSchema.parse(body)

  const product = await prisma.product.create({
    data,
    include: {
      category: true
    }
  })

  return product
})
