'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentNewWeeklyPlan } from '@/app/actions/notification'
import {
  findWeeklyPlans,
  findWeeklyPlanByWeek,
  createWeeklyPlan as dbCreateWeeklyPlan,
  updateWeeklyPlan as dbUpdateWeeklyPlan,
} from '@/services/weekly-plan.service'
import { findTeacherByEmail, findTeacherWithGroupStudents } from '@/services/teacher.service'

export async function getMyWeeklyPlans(page = 1, pageSize = 10) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return []

  return findWeeklyPlans(teacher.id, page, pageSize)
}

export async function createWeeklyPlan(data: {
  weekStart: string
  content: string
  monthlyEvent?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const weekStartDate = new Date(data.weekStart + 'T00:00:00.000Z')

  const [teacher, existing] = await Promise.all([
    findTeacherWithGroupStudents(session.user.email!),
    findTeacherByEmail(session.user.email!).then((t) =>
      t ? findWeeklyPlanByWeek(t.id, weekStartDate) : null
    ),
  ])
  if (!teacher) return
  if (existing) throw new Error('Энэ долоо хоногт төлөвлөгөө аль хэдийн байна')

  await dbCreateWeeklyPlan({
    teacherId: teacher.id,
    weekStart: weekStartDate,
    content: data.content,
    monthlyEvent: data.monthlyEvent || null,
  })

  if (teacher.group?.students) {
    const parentUserIds = teacher.group.students
      .filter((s) => s.parent)
      .map((s) => s.parent!.userId)

    const teacherName = `${teacher.user.lastname} ${teacher.user.firstname}`
    await notifyParentNewWeeklyPlan(parentUserIds, teacherName)
  }

  revalidatePath('/teacher/weekly-plan')
}

export async function updateWeeklyPlan(id: number, data: {
  content: string
  monthlyEvent?: string
}) {
  await dbUpdateWeeklyPlan(id, {
    content: data.content,
    monthlyEvent: data.monthlyEvent || null,
  })
  revalidatePath('/teacher/weekly-plan')
}
