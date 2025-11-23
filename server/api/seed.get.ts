import prisma from "#shared/prisma";

// Seed script to create initial data
export default defineEventHandler(async (event) => {
  // Create categories
  const vegetables = await prisma.category.upsert({
    where: { name: 'Овочі' },
    update: {},
    create: { name: 'Овочі', description: 'Свіжі овочі' }
  })

  const fruits = await prisma.category.upsert({
    where: { name: 'Фрукти' },
    update: {},
    create: { name: 'Фрукти', description: 'Свіжі фрукти' }
  })

  // Create sample products
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Картопля',
      categoryId: vegetables.id,
      price: 25.99,
      image: 'https://static.vecteezy.com/system/resources/previews/060/597/175/non_2x/3d-potato-icon-realistic-vegetable-illustration-free-png.png',
      description: 'Свіжа картопля'
    }
  })

  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Броколі',
      categoryId: vegetables.id,
      price: 45.99,
      image: 'https://static.vecteezy.com/system/resources/previews/059/246/432/non_2x/fresh-broccoli-vegetable-free-png.png',
      description: 'Свіже броколі'
    }
  })

  // Create sample users (password is "password" - change in production!)
  await prisma.user.upsert({
    where: { email: 'manager@shop.com' },
    update: {},
    create: {
      email: 'manager@shop.com',
      name: 'Менеджер',
      password: 'password',
      role: 'MANAGER'
    }
  })

  await prisma.user.upsert({
    where: { email: 'warehouse@shop.com' },
    update: {},
    create: {
      email: 'warehouse@shop.com',
      name: 'Працівник складу',
      password: 'password',
      role: 'WAREHOUSE'
    }
  })

  return { success: true, message: 'База даних заповнена початковими даними' }
})
