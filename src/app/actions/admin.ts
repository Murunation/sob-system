'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notifyReportStatus } from '@/app/actions/notification'

// ==========================================
// ТАЙЛАН
// ==========================================

export async function getAdminReports() {
  return await prisma.report.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function confirmReport(id: number) {
  const report = await prisma.report.update({
    where: { id },
    data: { status: 'CONFIRMED' }
  })

  // Тайлан илгээсэн хэрэглэгчид мэдэгдэх
  // Багш эсвэл тогооч олох
  const users = await prisma.user.findMany({
    where: { role: { in: ['TEACHER', 'CHEF'] } }
  })
  for (const user of users) {
    await notifyReportStatus(user.id, report.type, 'CONFIRMED')
  }

  revalidatePath('/admin/reports')
}

export async function returnReport(id: number) {
  const report = await prisma.report.update({
    where: { id },
    data: { status: 'RETURNED' }
  })

  // Тайлан илгээсэн хэрэглэгчид мэдэгдэх
  const users = await prisma.user.findMany({
    where: { role: { in: ['TEACHER', 'CHEF'] } }
  })
  for (const user of users) {
    await notifyReportStatus(user.id, report.type, 'RETURNED')
  }

  revalidatePath('/admin/reports')
}

// ==========================================
// САНАЛ ХҮСЭЛТ
// ==========================================

export async function getAdminFeedbacks() {
  return await prisma.feedback.findMany({
    include: {
      parent: { include: { user: true } },
      teacher: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function resolveFeedback(id: number) {
  await prisma.feedback.update({
    where: { id },
    data: { status: 'RESOLVED' }
  })
  revalidatePath('/admin/feedback')
}

// ==========================================
// ИРЦИЙН ЗАСВАР
// ==========================================

export async function getAllAttendanceByDate(date: string) {
  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    },
    include: { student: true },
    orderBy: { student: { firstname: 'asc' } }
  })
}

export async function adminUpdateAttendance(id: number, data: {
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'
  note?: string
}) {
  await prisma.attendance.update({
    where: { id },
    data: {
      status: data.status,
      note: data.note || null,
      editedBy: 'ADMIN',
      editedAt: new Date(),
    }
  })
  revalidatePath('/admin/attendance')
}