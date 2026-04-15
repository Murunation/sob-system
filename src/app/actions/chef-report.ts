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

const CHEF_REPORT_TYPES = ['Өдрийн хоолны тайлан', 'Сарын хоолны тайлан', 'Хоолны нэгдсэн тайлан']

export async function getChefReports(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const admin = await findFirstAdmin()
  if (!admin) return []

  const userId = Number((session.user as any).id)
  const all = await findReports(admin.id, CHEF_REPORT_TYPES, 1, 1000)

  const mine = all.filter((r) => {
    if (!r.filePath) return false
    try {
      const params = JSON.parse(r.filePath)
      return params.userId === userId
    } catch {
      return false
    }
  })

  return mine.slice((page - 1) * pageSize, page * pageSize)
}

export async function createChefReport(data: {
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
  const chef = await prisma.chef.findFirst({
    where: { userId },
    select: { id: true },
  })

  if (chef) {
    const params = JSON.stringify({
      role: 'CHEF',
      userId,
      chefId: chef.id,
      type: data.type,
      dateRange: data.dateRange,
    })
    await updateReportFilePath(report.id, params)
  }

  await notifyAdminNewReport(admin.userId, `Тогооч: ${data.type}`)
  revalidatePath('/chef/reports')

  return report.id
}
