import { prisma } from '@/lib/prisma'

export async function findWeeklyPlans(teacherId: number, page = 1, pageSize = 10) {
  return prisma.weeklyPlan.findMany({
    where: { teacherId },
    select: {
      id: true,
      teacherId: true,
      weekStart: true,
      content: true,
      monthlyEvent: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { weekStart: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findWeeklyPlanByWeek(teacherId: number, weekStart: Date) {
  return prisma.weeklyPlan.findFirst({
    where: { teacherId, weekStart },
    select: { id: true },
  })
}

export async function createWeeklyPlan(data: {
  teacherId: number
  weekStart: Date
  content: string
  monthlyEvent?: string | null
}) {
  return prisma.weeklyPlan.create({ data })
}

export async function updateWeeklyPlan(id: number, data: {
  content: string
  monthlyEvent?: string | null
}) {
  return prisma.weeklyPlan.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  })
}
