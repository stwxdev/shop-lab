import { z } from 'zod'
import prisma from "#shared/prisma";

const orderSchema = z.object({
  phone: z.string().min(1),
  address: z.string().min(1),
  comment: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = orderSchema.parse(body)

  const order = await prisma.order.create({
    data: {
      phone: data.phone,
      address: data.address,
      comment: data.comment,
      orderItems: {
        create: data.items
      }
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
