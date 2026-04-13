'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentNewReview } from '@/app/actions/notification'

export async function getMyGroupStudentsForReview() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { group: { include: { students: true } } }
  })

  return teacher?.group?.students || []
}

export async function getStudentReviews(studentId: number) {
  return await prisma.review.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createReview(data: {
  studentId: number
  behavior: string
  development: string
  note: string
  status: 'DRAFT' | 'SENT'
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!teacher) return

  await prisma.review.create({
    data: {
      studentId: data.studentId,
      teacherId: teacher.id,
      behavior: data.behavior,
      development: data.development,
      note: data.note,
      status: data.status,
    }
  })

  // SENT бол ААХ-д notification явуулах
  if (data.status === 'SENT') {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { parent: { include: { user: true } } }
    })
    if (student?.parent) {
      await notifyParentNewReview(
        student.parent.userId,
        `${student.lastname} ${student.firstname}`
      )
    }
  }

  revalidatePath('/teacher/reviews')
}

export async function updateReview(id: number, data: {
  behavior: string
  development: string
  note: string
  status: 'DRAFT' | 'SENT'
}) {
  const review = await prisma.review.update({
    where: { id },
    data: {
      behavior: data.behavior,
      development: data.development,
      note: data.note,
      status: data.status,
      updatedAt: new Date(),
    },
    include: {
      student: { include: { parent: { include: { user: true } } } }
    }
  })

  // SENT бол ААХ-д notification явуулах
  if (data.status === 'SENT' && review.student?.parent) {
    await notifyParentNewReview(
      review.student.parent.userId,
      `${review.student.lastname} ${review.student.firstname}`
    )
  }

  revalidatePath('/teacher/reviews')
}

export async function getMyReviews() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!teacher) return []

  return await prisma.review.findMany({
    where: { teacherId: teacher.id },
    include: { student: true },
    orderBy: { createdAt: 'desc' }
  })
}