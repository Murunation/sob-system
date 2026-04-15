'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyAdminNewReport } from '@/app/actions/notification'
import {
  findFirstAdmin,
  findReports,
  createReport as dbCreateReport,
  updateReportFilePath,
} from '@/services/report.service'
import { prisma } from '@/lib/prisma'

export async function getMyReports(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const admin = await findFirstAdmin()
  if (!admin) return []

  return findReports(admin.id, undefined, page, pageSize)
}

export async function createReport(data: {
  type: string
  dateRange: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const admin = await findFirstAdmin()
  if (!admin) return

  const report = await dbCreateReport({
    adminId: admin.id,
    type: data.type,
    dateRange: data.dateRange,
  })

  // Store generation params in filePath so admin can re-generate the Excel
  const userId = Number((session.user as any).id)
  const teacher = await prisma.teacher.findFirst({
    where: { userId },
    select: { id: true },
  })

  if (teacher) {
    const params = JSON.stringify({
      role: 'TEACHER',
      userId,
      teacherId: teacher.id,
      type: data.type,
      dateRange: data.dateRange,
    })
    await updateReportFilePath(report.id, params)
  }

  await notifyAdminNewReport(admin.userId, `Багш: ${data.type}`)
  revalidatePath('/teacher/reports')

  return report.id
}
