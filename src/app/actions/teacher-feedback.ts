'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentFeedbackReplied, notifyAdminNewFeedback } from '@/app/actions/notification'
import {
  findTeacherFeedbacks,
  replyToFeedback,
} from '@/services/feedback.service'
import { findTeacherByEmail } from '@/services/teacher.service'
import { findFirstAdmin } from '@/services/report.service'

export async function getMyFeedbacks(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return []

  return findTeacherFeedbacks(teacher.id, page, pageSize)
}

export async function replyFeedback(id: number, reply: string) {
  const feedback = await replyToFeedback(id, reply)

  const [, admin] = await Promise.all([
    notifyParentFeedbackReplied(
      feedback.parent.userId,
      `${feedback.teacher.user.lastname} ${feedback.teacher.user.firstname}`
    ),
    findFirstAdmin(),
  ])

  if (admin) {
    await notifyAdminNewFeedback(
      admin.userId,
      `${feedback.parent.user.lastname} ${feedback.parent.user.firstname}`,
      `${feedback.teacher.user.lastname} ${feedback.teacher.user.firstname}`
    )
  }

  revalidatePath('/teacher/feedback')
}
