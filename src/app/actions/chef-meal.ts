'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Тогоочийн мэдээлэл авах
async function getChef() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return await prisma.chef.findFirst({
    where: { user: { email: session.user.email } }
  })
}

// Тухайн өдрийн цэс авах
export async function getMealByDate(date: string) {
  return await prisma.meal.findFirst({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    }
  })
}

// Цэс үүсгэх
export async function createMeal(data: {
  date: string
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  const chef = await getChef()
  if (!chef) return

  const existing = await prisma.meal.findFirst({
    where: {
      date: {
        gte: new Date(data.date + 'T00:00:00.000Z'),
        lte: new Date(data.date + 'T23:59:59.999Z'),
      }
    }
  })
  if (existing) throw new Error('Энэ өдрийн цэс аль хэдийн бүртгэлтэй байна')

  await prisma.meal.create({
    data: {
      chefId: chef.id,
      date: new Date(data.date + 'T12:00:00.000Z'),
      menu: data.menu,
      ingredients: data.ingredients,
      allergyFlag: data.allergyFlag,
      status: 'PLANNED',
    }
  })
  revalidatePath('/chef/meal')
}

// Цэс засах
export async function updateMeal(id: number, data: {
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  await prisma.meal.update({
    where: { id },
    data: {
      menu: data.menu,
      ingredients: data.ingredients,
      allergyFlag: data.allergyFlag,
      updatedAt: new Date(),
    }
  })
  revalidatePath('/chef/meal')
}

// Сүүлийн 7 хоногийн цэснүүд авах
export async function getRecentMeals() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return await prisma.meal.findMany({
    where: { date: { gte: sevenDaysAgo } },
    orderBy: { date: 'desc' }
  })
}