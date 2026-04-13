'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    const [studentCount, teacherCount, groupCount, todayAttendance] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { isArchived: false } }),
      prisma.group.count({ where: { isArchived: false } }),
      prisma.attendance.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: 'PRESENT'
        }
      })
    ])

    return { studentCount, teacherCount, groupCount, todayAttendance }
  } catch (e) {
    console.error('Stats error:', e)
    return { studentCount: 0, teacherCount: 0, groupCount: 0, todayAttendance: 0 }
  }
}