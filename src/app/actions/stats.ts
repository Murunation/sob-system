'use server'

import { getDashboardStats as dbGetDashboardStats } from '@/services/stats.service'

export async function getDashboardStats() {
  try {
    return await dbGetDashboardStats()
  } catch (e) {
    console.error('Stats error:', e)
    return { studentCount: 0, teacherCount: 0, groupCount: 0, todayAttendance: 0 }
  }
}
