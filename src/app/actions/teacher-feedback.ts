'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentFeedbackReplied, notifyAdminNewFeedback } from '@/app/actions/notification'

export async function getMyFeedbacks() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!teacher) return []

  return await prisma.feedback.findMany({
    where: { teacherId: teacher.id },
    include: { parent: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function replyFeedback(id: number, reply: string) {
  const feedback = await prisma.feedback.update({
    where: { id },
    data: {
      reply,
      status: 'REPLIED',
      updatedAt: new Date(),
    },
    include: {
      parent: { include: { user: true } },
      teacher: { include: { user: true } }
    }
  })

  // ААХ-д notification явуулах
  await notifyParentFeedbackReplied(
    feedback.parent.userId,
    `${feedback.teacher.user.lastname} ${feedback.teacher.user.firstname}`
  )

  // Админд notification явуулах
  const admin = await prisma.admin.findFirst({ include: { user: true } })
  if (admin) {
    await notifyAdminNewFeedback(
      admin.userId,
      `${feedback.parent.user.lastname} ${feedback.parent.user.firstname}`,
      `${feedback.teacher.user.lastname} ${feedback.teacher.user.firstname}`
    )
  }

  revalidatePath('/teacher/feedback')
}