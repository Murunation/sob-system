'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  findChefByEmail,
  findMealByDate,
  createMeal as dbCreateMeal,
  updateMeal as dbUpdateMeal,
  findRecentMeals,
} from '@/services/meal.service'

export async function getMealByDate(date: string) {
  return findMealByDate(date)
}

export async function createMeal(data: {
  date: string
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const [chef, existing] = await Promise.all([
    findChefByEmail(session.user.email!),
    findMealByDate(data.date),
  ])
  if (!chef) return
  if (existing) throw new Error('Энэ өдрийн цэс аль хэдийн бүртгэлтэй байна')

  await dbCreateMeal({
    chefId: chef.id,
    date: new Date(data.date + 'T12:00:00.000Z'),
    menu: data.menu,
    ingredients: data.ingredients,
    allergyFlag: data.allergyFlag,
  })
  revalidatePath('/chef/meal')
}

export async function updateMeal(id: number, data: {
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  await dbUpdateMeal(id, data)
  revalidatePath('/chef/meal')
}

export async function getRecentMeals(page = 1, pageSize = 20) {
  return findRecentMeals(7, page, pageSize)
}
