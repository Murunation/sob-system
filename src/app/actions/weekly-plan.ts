'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentNewWeeklyPlan } from '@/app/actions/notification'

export async function getMyWeeklyPlans() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!teacher) return []

  return await prisma.weeklyPlan.findMany({
    where: { teacherId: teacher.id },
    orderBy: { weekStart: 'desc' }
  })
}

export async function createWeeklyPlan(data: {
  weekStart: string
  content: string
  monthlyEvent?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      user: true,
      group: {
        include: {
          students: {
            include: { parent: { include: { user: true } } }
          }
        }
      }
    }
  })
  if (!teacher) return

  const existing = await prisma.weeklyPlan.findFirst({
    where: {
      teacherId: teacher.id,
      weekStart: new Date(data.weekStart + 'T00:00:00.000Z')
    }
  })
  if (existing) throw new Error('Энэ долоо хоногт төлөвлөгөө аль хэдийн байна')

  await prisma.weeklyPlan.create({
    data: {
      teacherId: teacher.id,
      weekStart: new Date(data.weekStart + 'T00:00:00.000Z'),
      content: data.content,
      monthlyEvent: data.monthlyEvent || null,
    }
  })

  // Бүлгийн бүх ААХ-д notification явуулах
  if (teacher.group?.students) {
    const parentUserIds = teacher.group.students
      .filter(s => s.parent)
      .map(s => s.parent!.userId)

    const teacherName = `${teacher.user.lastname} ${teacher.user.firstname}`
    await notifyParentNewWeeklyPlan(parentUserIds, teacherName)
  }

  revalidatePath('/teacher/weekly-plan')
}

export async function updateWeeklyPlan(id: number, data: {
  content: string
  monthlyEvent?: string
}) {
  await prisma.weeklyPlan.update({
    where: { id },
    data: {
      content: data.content,
      monthlyEvent: data.monthlyEvent || null,
      updatedAt: new Date(),
    }
  })
  revalidatePath('/teacher/weekly-plan')
}