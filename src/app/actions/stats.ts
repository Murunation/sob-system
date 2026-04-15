'use server'

import { unstable_cache } from 'next/cache'
import { getDashboardStats as dbGetDashboardStats } from '@/services/stats.service'

const getCachedDashboardStats = unstable_cache(
  () => dbGetDashboardStats(),
  ['admin-dashboard-stats'],
  { revalidate: 30, tags: ['dashboard-stats'] }
)

export async function getDashboardStats() {
  try {
    return await getCachedDashboardStats()
  } catch (e) {
    console.error('Stats error:', e)
    return { studentCount: 0, teacherCount: 0, groupCount: 0, todayAttendance: 0 }
  }
}
