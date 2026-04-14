'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyParentNewReview } from '@/app/actions/notification'
import {
  findStudentReviews,
  findTeacherReviews,
  createReview as dbCreateReview,
  updateReviewById,
  findStudentWithParent,
} from '@/services/review.service'
import {
  findTeacherByEmail,
  findTeacherWithGroupStudents,
} from '@/services/teacher.service'

export async function getMyGroupStudentsForReview() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherWithGroupStudents(session.user.email!)
  return teacher?.group?.students || []
}

export async function getStudentReviews(studentId: number, page = 1, pageSize = 20) {
  return findStudentReviews(studentId, page, pageSize)
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

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return

  await dbCreateReview({
    studentId: data.studentId,
    teacherId: teacher.id,
    behavior: data.behavior,
    development: data.development,
    note: data.note,
    status: data.status,
  })

  if (data.status === 'SENT') {
    const student = await findStudentWithParent(data.studentId)
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
  const review = await updateReviewById(id, data)

  if (data.status === 'SENT' && review.student?.parent) {
    await notifyParentNewReview(
      review.student.parent.userId,
      `${review.student.lastname} ${review.student.firstname}`
    )
  }

  revalidatePath('/teacher/reviews')
}

export async function getMyReviews(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return []

  return findTeacherReviews(teacher.id, page, pageSize)
}
