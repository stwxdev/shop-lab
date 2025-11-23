import { z } from 'zod'
import prisma from "#shared/prisma";

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'MANAGER')
  
  const body = await readBody(event)
  const data = categorySchema.parse(body)

  const category = await prisma.category.create({
    data
  })

  return category
})
