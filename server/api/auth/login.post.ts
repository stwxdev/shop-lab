import { z } from 'zod'
import prisma from "#shared/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = loginSchema.parse(body)

  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.password !== data.password) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  setSession(event, user.id)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})
