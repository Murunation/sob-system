'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getChefDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const today = new Date()
  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(today); todayEnd.setHours(23, 59, 59, 999)

  const chef = await prisma.chef.findFirst({
    where: { user: { email: session.user.email } },
    select: {
      id: true,
      user: {
        select: { firstname: true, lastname: true, phone: true, email: true },
      },
      meals: {
        where: { date: { gte: todayStart, lte: todayEnd } },
        select: {
          id: true,
          menu: true,
          ingredients: true,
          status: true,
          allergyFlag: true,
        },
      },
    },
  })

  if (!chef) return null

  const dayOfWeek = today.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + daysToMonday)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 4)
  weekEnd.setHours(23, 59, 59, 999)

  const [presentCount, totalStudents, weekMeals] = await Promise.all([
    prisma.attendance.count({
      where: { date: { gte: todayStart, lte: todayEnd }, status: 'PRESENT' },
    }),
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.meal.findMany({
      where: { chefId: chef.id, date: { gte: weekStart, lte: weekEnd } },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, menu: true, status: true },
    }),
  ])

  return {
    chef: {
      firstname: chef.user.firstname,
      lastname: chef.user.lastname,
      phone: chef.user.phone,
      email: chef.user.email,
    },
    todayMeals: chef.meals,
    presentCount,
    totalStudents,
    weekMeals,
  }
}
