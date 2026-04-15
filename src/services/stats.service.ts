import { prisma } from '@/lib/prisma'

function dayBounds(offsetFromToday = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offsetFromToday)
  const start = new Date(d); start.setHours(0, 0, 0, 0)
  const end   = new Date(d); end.setHours(23, 59, 59, 999)
  return { start, end, date: d }
}

export async function getDashboardStats() {
  const { start: todayStart, end: todayEnd } = dayBounds(0)
  const { start: weekStart } = dayBounds(6)

  // ── Core counts + weekly attendance records — single batch ─────────────────
  const [studentCount, teacherCount, groupCount, parentCount, todayPresent, weeklyRecords] =
    await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { isArchived: false } }),
      prisma.group.count({ where: { isArchived: false } }),
      prisma.parent.count({ where: { user: { isArchived: false } } }),
      prisma.attendance.count({
        where: { date: { gte: todayStart, lte: todayEnd }, status: 'PRESENT' },
      }),
      // 1 query instead of 7
      prisma.attendance.findMany({
        where: { date: { gte: weekStart, lte: todayEnd }, status: 'PRESENT' },
        select: { date: true },
      }),
    ])

  // ── 7-day attendance trend — built in JS ───────────────────────────────────
  const countByDate = new Map<string, number>()
  weeklyRecords.forEach((r) => {
    const d = new Date(r.date).toISOString().split('T')[0]
    countByDate.set(d, (countByDate.get(d) ?? 0) + 1)
  })
  const weeklyAttendance = Array.from({ length: 7 }, (_, i) => {
    const { date } = dayBounds(6 - i)
    const dateStr = date.toISOString().split('T')[0]
    return {
      label: date.toLocaleDateString('mn-MN', { weekday: 'short' }),
      date: dateStr,
      count: countByDate.get(dateStr) ?? 0,
    }
  })

  // ── Group attendance today ─────────────────────────────────────────────────
  const groups = await prisma.group.findMany({
    where: { isArchived: false },
    select: {
      name: true,
      students: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          attendances: {
            where: { date: { gte: todayStart, lte: todayEnd }, status: 'PRESENT' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const groupAttendance = groups.map((g) => ({
    name: g.name,
    total: g.students.length,
    present: g.students.filter((s) => s.attendances.length > 0).length,
  }))

  // ── Action insights ────────────────────────────────────────────────────────
  const [noParent, noGroup, pendingFeedback] = await Promise.all([
    prisma.student.count({ where: { status: 'ACTIVE', parentId: null } }),
    prisma.student.count({ where: { status: 'ACTIVE', groupId: null } }),
    prisma.feedback.count({ where: { status: 'PENDING' } }),
  ])

  return {
    studentCount,
    teacherCount,
    groupCount,
    parentCount,
    todayAttendance: todayPresent,
    todayAttendanceRate: studentCount > 0 ? Math.round((todayPresent / studentCount) * 100) : 0,
    weeklyAttendance,
    groupAttendance,
    insights: {
      noParent,
      noGroup,
      pendingFeedback,
    },
  }
}
