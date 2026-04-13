'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyAdminNewReport, notifyReportStatus } from '@/app/actions/notification'

export async function getMyReports() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const admin = await prisma.admin.findFirst()
  if (!admin) return []

  return await prisma.report.findMany({
    where: { adminId: admin.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createReport(data: {
  type: string
  dateRange: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const admin = await prisma.admin.findFirst({
    include: { user: true }
  })
  if (!admin) return

  await prisma.report.create({
    data: {
      adminId: admin.id,
      type: data.type,
      dateRange: data.dateRange,
      status: 'SENT',
    }
  })

  // Admin-д notification явуулах
  await notifyAdminNewReport(admin.userId, `Багш: ${data.type}`)

  revalidatePath('/teacher/reports')
}