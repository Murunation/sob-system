import { prisma } from '@/lib/prisma'

export async function findFirstAdmin() {
  return prisma.admin.findFirst({
    select: { id: true, userId: true },
  })
}

export async function findReports(adminId: number, typeFilter?: string[], page = 1, pageSize = 20) {
  return prisma.report.findMany({
    where: {
      adminId,
      ...(typeFilter ? { type: { in: typeFilter } } : {}),
    },
    select: {
      id: true,
      adminId: true,
      type: true,
      dateRange: true,
      status: true,
      filePath: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function createReport(data: {
  adminId: number
  type: string
  dateRange: string
}) {
  return prisma.report.create({
    data: { ...data, status: 'SENT' },
  })
}

export async function updateReportStatus(id: number, status: 'CONFIRMED' | 'RETURNED') {
  return prisma.report.update({
    where: { id },
    data: { status },
    select: { id: true, type: true, adminId: true },
  })
}
