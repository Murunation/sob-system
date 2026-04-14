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

  // ── Core counts ────────────────────────────────────────────────────────────
  const [studentCount, teacherCount, groupCount, parentCount, todayPresent] =
    await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { isArchived: false } }),
      prisma.group.count({ where: { isArchived: false } }),
      prisma.parent.count({ where: { user: { isArchived: false } } }),
      prisma.attendance.count({
        where: { date: { gte: todayStart, lte: todayEnd }, status: 'PRESENT' },
      }),
    ])

  // ── 7-day attendance trend ─────────────────────────────────────────────────
  const weeklyAttendance = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const { start, end, date } = dayBounds(6 - i)
      return prisma.attendance
        .count({ where: { date: { gte: start, lte: end }, status: 'PRESENT' } })
        .then((count) => ({
          label: date.toLocaleDateString('mn-MN', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          count,
        }))
    })
  )

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
