'use server'

import { revalidatePath } from 'next/cache'
import { notifyAdminNewReport } from '@/app/actions/notification'
import { findFirstAdmin, findReports, createReport as dbCreateReport } from '@/services/report.service'

const CHEF_REPORT_TYPES = ['Өдрийн хоолны тайлан', 'Сарын хоолны тайлан', 'Хоолны нэгдсэн тайлан']

export async function getChefReports(page = 1, pageSize = 20) {
  const admin = await findFirstAdmin()
  if (!admin) return []

  return findReports(admin.id, CHEF_REPORT_TYPES, page, pageSize)
}

export async function createChefReport(data: {
  type: string
  dateRange: string
}) {
  const admin = await findFirstAdmin()
  if (!admin) return

  await dbCreateReport({
    adminId: admin.id,
    type: data.type,
    dateRange: data.dateRange,
  })

  await notifyAdminNewReport(admin.userId, `Тогооч: ${data.type}`)
  revalidatePath('/chef/reports')
}
