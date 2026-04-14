'use server'

import { revalidatePath } from 'next/cache'
import { notifyReportStatus } from '@/app/actions/notification'
import {
  findAllAttendanceByDate,
  updateAttendanceById,
} from '@/services/attendance.service'
import { findAllFeedbacks, updateFeedbackStatus } from '@/services/feedback.service'
import { findFirstAdmin, findReports, updateReportStatus } from '@/services/report.service'
import { findUsersByRoles } from '@/services/admin.service'

// ==========================================
// ТАЙЛАН
// ==========================================

export async function getAdminReports(page = 1, pageSize = 20) {
  const admin = await findFirstAdmin()
  if (!admin) return []
  return findReports(admin.id, undefined, page, pageSize)
}

export async function confirmReport(id: number) {
  const [report, users] = await Promise.all([
    updateReportStatus(id, 'CONFIRMED'),
    findUsersByRoles(['TEACHER', 'CHEF']),
  ])

  await Promise.all(
    users.map((user) => notifyReportStatus(user.id, report.type, 'CONFIRMED'))
  )

  revalidatePath('/admin/reports')
}

export async function returnReport(id: number) {
  const [report, users] = await Promise.all([
    updateReportStatus(id, 'RETURNED'),
    findUsersByRoles(['TEACHER', 'CHEF']),
  ])

  await Promise.all(
    users.map((user) => notifyReportStatus(user.id, report.type, 'RETURNED'))
  )

  revalidatePath('/admin/reports')
}

// ==========================================
// САНАЛ ХҮСЭЛТ
// ==========================================

export async function getAdminFeedbacks(page = 1, pageSize = 20) {
  return findAllFeedbacks(page, pageSize)
}

export async function resolveFeedback(id: number) {
  await updateFeedbackStatus(id, 'RESOLVED')
  revalidatePath('/admin/feedback')
}

// ==========================================
// ИРЦИЙН ЗАСВАР
// ==========================================

export async function getAllAttendanceByDate(date: string) {
  return findAllAttendanceByDate(date)
}

export async function adminUpdateAttendance(id: number, data: {
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'
  note?: string
}) {
  await updateAttendanceById(id, {
    status: data.status,
    note: data.note || null,
    editedBy: 'ADMIN',
  })
  revalidatePath('/admin/attendance')
}
