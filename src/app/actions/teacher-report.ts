'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyAdminNewReport } from '@/app/actions/notification'
import { findFirstAdmin, findReports, createReport as dbCreateReport } from '@/services/report.service'

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

  await dbCreateReport({
    adminId: admin.id,
    type: data.type,
    dateRange: data.dateRange,
  })

  await notifyAdminNewReport(admin.userId, `Багш: ${data.type}`)
  revalidatePath('/teacher/reports')
}
