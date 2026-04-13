'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Өнөөдрийн хоолны цэс авах
export async function getTodayMeal(date: string) {
  return await prisma.meal.findFirst({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    }
  })
}

// Багшийн бүлгийн хүүхдүүдийн хооллолтын тэмдэглэл авах
export async function getMealLogs(date: string) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { group: { include: { students: true } } }
  })
  if (!teacher?.group) return []

  const students = teacher.group.students

  const meal = await prisma.meal.findFirst({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    }
  })

  const logs = meal ? await prisma.mealLog.findMany({
    where: {
      mealId: meal.id,
      studentId: { in: students.map(s => s.id) }
    }
  }) : []

  return { students, meal, logs }
}

// Хооллолтын тэмдэглэл хадгалах
export async function saveMealLogs(data: {
  date: string
  mealId: number
  records: {
    studentId: number
    eaten: boolean
    note?: string
  }[]
}) {
  for (const record of data.records) {
    const existing = await prisma.mealLog.findFirst({
      where: {
        studentId: record.studentId,
        mealId: data.mealId,
      }
    })

    if (existing) {
      await prisma.mealLog.update({
        where: { id: existing.id },
        data: {
          eaten: record.eaten,
          note: record.note || null,
        }
      })
    } else {
      await prisma.mealLog.create({
        data: {
          studentId: record.studentId,
          mealId: data.mealId,
          eaten: record.eaten,
          note: record.note || null,
        }
      })
    }
  }

  revalidatePath('/teacher/meal-log')
}