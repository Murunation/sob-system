'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { notifyTeacherNewFeedback, notifyAdminNewFeedback } from '@/app/actions/notification'
import {
  findParentWithStudents,
  findParentByEmail,
  findParentByPhone,
  createParentWithUser,
  findParents,
  findParentsFull,
  updateParentById as dbUpdateParent,
  archiveParentById as dbArchiveParent,
  completeParentProfile as dbCompleteProfile,
  findChildAttendance,
  findChildPayments,
} from '@/services/parent.service'
import { setStudentParent } from '@/services/student.service'
import { findConfirmedRecentMeals } from '@/services/meal.service'
import {
  findChildReviews,
  markReviewsAsRead,
} from '@/services/review.service'
import { findWeeklyPlans } from '@/services/weekly-plan.service'
import { createFeedback, findParentFeedbacks } from '@/services/feedback.service'
import { findFirstAdmin } from '@/services/report.service'

async function getMyParent() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return findParentWithStudents(session.user.email!)
}

/** Эцэг эхийн бүх хүүхдийг буцаана */
export async function getMyChildren() {
  const parent = await getMyParent()
  return parent?.students ?? []
}

/** Тодорхой хүүхдийн ирцийг буцаана. studentId тухайн эцэг эхийнх эсэхийг шалгана. */
export async function getMyChildAttendance(studentId: number, page = 1, pageSize = 30) {
  const parent = await getMyParent()
  if (!parent) return { student: null, records: [] }

  const student = parent.students.find((s) => s.id === studentId) ?? parent.students[0]
  if (!student) return { student: null, records: [] }

  const records = await findChildAttendance(student.id, page, pageSize)
  return { student, records }
}

export async function getRecentMealsForParent() {
  return findConfirmedRecentMeals(7)
}

export async function getMyChildReviews(page = 1, pageSize = 20) {
  const parent = await getMyParent()
  const student = parent?.students[0]
  if (!student) return { student: null, reviews: [] }

  const [reviews] = await Promise.all([
    findChildReviews(student.id, page, pageSize),
    markReviewsAsRead(student.id),
  ])

  return { student, reviews }
}

export async function getMyChildWeeklyPlan(page = 1, pageSize = 4) {
  const parent = await getMyParent()
  const student = parent?.students[0]
  if (!student?.group?.teacher) return { student: null, plans: [] }

  const plans = await findWeeklyPlans(student.group.teacher.id, page, pageSize)
  return { student, plans }
}

export async function sendFeedback(data: { message: string }) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const parent = await findParentWithStudents(session.user.email!)
  if (!parent) return

  const teacher = parent.students[0]?.group?.teacher
  if (!teacher) throw new Error('Багш олдсонгүй')

  const [, admin] = await Promise.all([
    createFeedback({
      parentId: parent.id,
      teacherId: teacher.id,
      message: data.message,
    }),
    findFirstAdmin(),
  ])

  const parentName = `${parent.user.lastname} ${parent.user.firstname}`

  await Promise.all([
    notifyTeacherNewFeedback(teacher.userId, parentName),
    ...(admin
      ? [
          notifyAdminNewFeedback(
            admin.userId,
            parentName,
            `${teacher.user.lastname} ${teacher.user.firstname}`
          ),
        ]
      : []),
  ])

  revalidatePath('/parent/feedback')
}

export async function getMyFeedbacks(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const parent = await findParentByEmail(session.user.email!)
  if (!parent) return []

  return findParentFeedbacks(parent.id, page, pageSize)
}

export async function getMyPayments(page = 1, pageSize = 20) {
  const parent = await getMyParent()
  const student = parent?.students[0]
  if (!student) return { student: null, payments: [] }

  const payments = await findChildPayments(student.id, page, pageSize)
  return { student, payments }
}

export const getParents = unstable_cache(
  () => findParents(),
  ['parents'],
  { tags: ['parents'], revalidate: 300 }
)

// ── Invite parent ─────────────────────────────────────────────────────────────

function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export type InviteParentResult =
  | { ok: true; existing: true; parentName: string }
  | { ok: true; existing: false; username: string; password: string; parentName: string }
  | { ok: false; error: string }

export async function inviteParent(
  studentId: number,
  data: { lastname: string; firstname: string; phone: string; email?: string }
): Promise<InviteParentResult> {
  const phone = data.phone.trim()
  const parentName = `${data.lastname.trim()} ${data.firstname.trim()}`

  // Утасны дугаар аль хэдийн бүртгэлтэй бол
  const existing = await findParentByPhone(phone)
  if (existing) {
    await setStudentParent(studentId, existing.id)
    revalidateTag('students')
    revalidatePath('/admin/students')
    revalidatePath('/teacher/students')
    const name = `${existing.user.lastname} ${existing.user.firstname}`
    return { ok: true, existing: true, parentName: name }
  }

  // Шинэ эцэг эх үүсгэх
  const plainPassword = generatePassword()
  const passwordHash = await hash(plainPassword, 10)
  const username = phone  // утасны дугаар = username

  try {
    const created = await createParentWithUser({
      firstname: data.firstname.trim(),
      lastname: data.lastname.trim(),
      phone,
      email: data.email?.trim() || null,
      username,
      passwordHash,
    })

    const parentId = created.parent!.id
    await setStudentParent(studentId, parentId)

    revalidateTag('students')
    revalidateTag('parents')
    revalidatePath('/admin/students')
    revalidatePath('/teacher/students')

    return { ok: true, existing: false, username, password: plainPassword, parentName }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return { ok: false, error: 'Энэ утас эсвэл имэйл аль хэдийн бүртгэлтэй байна' }
    }
    return { ok: false, error: 'Бүртгэхэд алдаа гарлаа' }
  }
}

// ── Admin / Teacher: parent management ───────────────────────────────────────

export const getParentsFull = unstable_cache(
  () => findParentsFull(),
  ['parents-full'],
  { tags: ['parents'], revalidate: 60 }
)

export async function updateParentById(
  parentId: number,
  data: { firstname: string; lastname: string; phone: string; email?: string | null; address?: string | null }
) {
  try {
    await dbUpdateParent(parentId, data)
    revalidateTag('parents')
    revalidatePath('/admin/parents')
    revalidatePath('/teacher/parents')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      throw new Error('Энэ утасны дугаар аль хэдийн бүртгэлтэй байна')
    }
    throw err
  }
}

export async function archiveParentById(parentId: number) {
  await dbArchiveParent(parentId)
  revalidateTag('parents')
  revalidatePath('/admin/parents')
  revalidatePath('/teacher/parents')
}

// ── Parent: first-login profile completion ────────────────────────────────────

export async function getParentDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999)
  const todayStr = today.toISOString().split('T')[0]

  const parent = await prisma.parent.findFirst({
    where: { user: { email: session.user.email } },
    select: {
      id: true,
      user: {
        select: { firstname: true, lastname: true, phone: true, email: true },
      },
      students: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          birthDate: true,
          healthInfo: true,
          group: {
            select: {
              name: true,
              ageRange: true,
              teacher: {
                select: {
                  user: { select: { firstname: true, lastname: true } },
                },
              },
            },
          },
          attendances: {
            where: { date: { gte: sevenDaysAgo, lte: todayEnd } },
            orderBy: { date: 'asc' },
            select: { date: true, status: true },
          },
        },
      },
    },
  })

  if (!parent) return null

  const children = parent.students.map(student => {
    const totalDays = student.attendances.length
    const presentDays = student.attendances.filter(a => a.status === 'PRESENT').length
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

    const todayAtt = student.attendances.find(a => {
      const d = new Date(a.date)
      return d.toISOString().split('T')[0] === todayStr
    })

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(sevenDaysAgo.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const att = student.attendances.find(a => {
        const ad = new Date(a.date)
        return ad.toISOString().split('T')[0] === dateStr
      })
      return {
        label: d.toLocaleDateString('mn-MN', { weekday: 'short' }),
        date: dateStr,
        status: att?.status ?? null,
      }
    })

    const age = Math.floor(
      (today.getTime() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000)
    )

    return {
      id: student.id,
      firstname: student.firstname,
      lastname: student.lastname,
      age,
      healthInfo: student.healthInfo,
      group: student.group
        ? {
            name: student.group.name,
            ageRange: student.group.ageRange,
            teacherName: student.group.teacher
              ? `${student.group.teacher.user.lastname} ${student.group.teacher.user.firstname}`
              : null,
          }
        : null,
      presentDays,
      totalDays,
      attendanceRate,
      todayStatus: todayAtt?.status ?? null,
      chartData,
    }
  })

  return {
    parent: {
      firstname: parent.user.firstname,
      lastname: parent.user.lastname,
      phone: parent.user.phone,
      email: parent.user.email,
    },
    children,
  }
}

export async function completeProfile(data: { email: string; address?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const userId = Number((session.user as any).id)
  await dbCompleteProfile(userId, { email: data.email, address: data.address ?? null })

  revalidateTag('parents')
}
