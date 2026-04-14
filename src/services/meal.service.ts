import { prisma } from '@/lib/prisma'

const mealSelect = {
  id: true,
  chefId: true,
  date: true,
  menu: true,
  ingredients: true,
  allergyFlag: true,
  servedStudents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function findChefByEmail(email: string) {
  return prisma.chef.findFirst({
    where: { user: { email } },
    select: { id: true, userId: true },
  })
}

export async function findMealByDate(date: string) {
  return prisma.meal.findFirst({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      },
    },
    select: mealSelect,
  })
}

export async function findRecentMeals(daysBack: number, page = 1, pageSize = 20) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  return prisma.meal.findMany({
    where: { date: { gte: cutoff } },
    select: mealSelect,
    orderBy: { date: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findConfirmedRecentMeals(daysBack: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  return prisma.meal.findMany({
    where: {
      date: { gte: cutoff },
      status: { in: ['CONFIRMED', 'CLOSED'] },
    },
    select: mealSelect,
    orderBy: { date: 'desc' },
  })
}

export async function createMeal(data: {
  chefId: number
  date: Date
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  return prisma.meal.create({ data: { ...data, status: 'PLANNED' } })
}

export async function updateMeal(id: number, data: {
  menu: string
  ingredients: string
  allergyFlag: boolean
}) {
  return prisma.meal.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  })
}

export async function findMealLogs(mealId: number, studentIds: number[]) {
  return prisma.mealLog.findMany({
    where: {
      mealId,
      studentId: { in: studentIds },
    },
    select: { id: true, studentId: true, mealId: true, eaten: true, note: true },
  })
}

export async function upsertMealLog(data: {
  studentId: number
  mealId: number
  eaten: boolean
  note?: string | null
}) {
  const existing = await prisma.mealLog.findFirst({
    where: { studentId: data.studentId, mealId: data.mealId },
    select: { id: true },
  })

  if (existing) {
    return prisma.mealLog.update({
      where: { id: existing.id },
      data: { eaten: data.eaten, note: data.note ?? null },
    })
  }

  return prisma.mealLog.create({
    data: {
      studentId: data.studentId,
      mealId: data.mealId,
      eaten: data.eaten,
      note: data.note ?? null,
    },
  })
}
