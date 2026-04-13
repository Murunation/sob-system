'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notifyAdminNewReport } from '@/app/actions/notification'

export async function getChefReports() {
  const admin = await prisma.admin.findFirst()
  if (!admin) return []

  return await prisma.report.findMany({
    where: {
      adminId: admin.id,
      type: { in: ['Өдрийн хоолны тайлан', 'Сарын хоолны тайлан', 'Хоолны нэгдсэн тайлан'] }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createChefReport(data: {
  type: string
  dateRange: string
}) {
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
  await notifyAdminNewReport(admin.userId, `Тогооч: ${data.type}`)

  revalidatePath('/chef/reports')
}