'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyTeacherNewFeedback, notifyAdminNewFeedback } from '@/app/actions/notification'

async function getMyStudent() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const parent = await prisma.parent.findFirst({
    where: { user: { email: session.user.email } },
    include: { students: { include: { group: { include: { teacher: { include: { user: true } } } } } } }
  })

  return parent?.students[0] || null
}

export async function getMyChildAttendance() {
  const student = await getMyStudent()
  if (!student) return { student: null, records: [] }

  const records = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' },
    take: 30
  })

  return { student, records }
}

export async function getRecentMealsForParent() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return await prisma.meal.findMany({
    where: {
      date: { gte: sevenDaysAgo },
      status: { in: ['CONFIRMED', 'CLOSED'] }
    },
    orderBy: { date: 'desc' }
  })
}

export async function getMyChildReviews() {
  const student = await getMyStudent()
  if (!student) return { student: null, reviews: [] }

  const reviews = await prisma.review.findMany({
    where: {
      studentId: student.id,
      status: { in: ['SENT', 'READ'] }
    },
    include: { teacher: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  })

  await prisma.review.updateMany({
    where: { studentId: student.id, status: 'SENT' },
    data: { status: 'READ', readAt: new Date() }
  })

  return { student, reviews }
}

export async function getMyChildWeeklyPlan() {
  const student = await getMyStudent()
  if (!student?.group?.teacher) return { student: null, plans: [] }

  const plans = await prisma.weeklyPlan.findMany({
    where: { teacherId: student.group.teacher.id },
    orderBy: { weekStart: 'desc' },
    take: 4
  })

  return { student, plans }
}

export async function sendFeedback(data: { message: string }) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const parent = await prisma.parent.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      user: true,
      students: { include: { group: { include: { teacher: { include: { user: true } } } } } }
    }
  })
  if (!parent) return

  const teacher = parent.students[0]?.group?.teacher
  if (!teacher) throw new Error('Багш олдсонгүй')

  await prisma.feedback.create({
    data: {
      parentId: parent.id,
      teacherId: teacher.id,
      message: data.message,
      status: 'PENDING',
    }
  })

  const parentName = `${parent.user.lastname} ${parent.user.firstname}`

  // Багшид notification явуулах
  await notifyTeacherNewFeedback(teacher.userId, parentName)

  // Админд notification явуулах
  const admin = await prisma.admin.findFirst({ include: { user: true } })
  if (admin) {
    await notifyAdminNewFeedback(
      admin.userId,
      parentName,
      `${teacher.user.lastname} ${teacher.user.firstname}`
    )
  }

  revalidatePath('/parent/feedback')
}

export async function getMyFeedbacks() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const parent = await prisma.parent.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!parent) return []

  return await prisma.feedback.findMany({
    where: { parentId: parent.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getMyPayments() {
  const student = await getMyStudent()
  if (!student) return { student: null, payments: [] }

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' }
  })

  return { student, payments }
}

export async function getParents() {
  return await prisma.parent.findMany({
    include: { user: true },
    orderBy: { id: 'asc' }
  })
}