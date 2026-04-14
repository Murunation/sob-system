'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  findMealByDate,
  findMealLogs,
  upsertMealLog,
} from '@/services/meal.service'
import { findTeacherWithGroupStudents } from '@/services/teacher.service'

export async function getTodayMeal(date: string) {
  return findMealByDate(date)
}

export async function getMealLogs(date: string) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const [teacher, meal] = await Promise.all([
    findTeacherWithGroupStudents(session.user.email!),
    findMealByDate(date),
  ])
  if (!teacher?.group) return []

  const students = teacher.group.students
  const logs = meal ? await findMealLogs(meal.id, students.map((s) => s.id)) : []

  return { students, meal, logs }
}

export async function saveMealLogs(data: {
  date: string
  mealId: number
  records: {
    studentId: number
    eaten: boolean
    note?: string
  }[]
}) {
  await Promise.all(
    data.records.map((record) =>
      upsertMealLog({
        studentId: record.studentId,
        mealId: data.mealId,
        eaten: record.eaten,
        note: record.note || null,
      })
    )
  )

  revalidatePath('/teacher/meal-log')
}
