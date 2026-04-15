'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function dayBounds(offsetFromToday = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offsetFromToday)
  const start = new Date(d); start.setHours(0, 0, 0, 0)
  const end   = new Date(d); end.setHours(23, 59, 59, 999)
  return { start, end, date: d }
}

export async function getTeacherDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const { start: todayStart, end: todayEnd } = dayBounds(0)

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    select: {
      id: true,
      profession: true,
      user: {
        select: { firstname: true, lastname: true, phone: true, email: true },
      },
      group: {
        select: {
          id: true,
          name: true,
          ageRange: true,
          capacity: true,
          students: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              attendances: {
                where: { date: { gte: todayStart, lte: todayEnd } },
                select: { status: true },
              },
            },
          },
        },
      },
    },
  })

  if (!teacher) return null

  const students = teacher.group?.students ?? []
  const totalStudents = students.length
  const presentToday = students.filter(s =>
    s.attendances.some(a => a.status === 'PRESENT')
  ).length
  const absentToday = students.filter(s =>
    s.attendances.some(a => a.status === 'ABSENT')
  ).length
  const sickToday = students.filter(s =>
    s.attendances.some(a => a.status === 'SICK' || a.status === 'EXCUSED')
  ).length
  const notMarked = students.filter(s => s.attendances.length === 0).length
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0

  const groupId = teacher.group?.id
  const weeklyAttendance = groupId
    ? await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const { start, end, date } = dayBounds(6 - i)
          return prisma.attendance
            .count({
              where: {
                student: { groupId },
                date: { gte: start, lte: end },
                status: 'PRESENT',
              },
            })
            .then(count => ({
              label: date.toLocaleDateString('mn-MN', { weekday: 'short' }),
              date: date.toISOString().split('T')[0],
              count,
            }))
        })
      )
    : []

  return {
    teacher: {
      firstname: teacher.user.firstname,
      lastname: teacher.user.lastname,
      profession: teacher.profession,
      phone: teacher.user.phone,
      email: teacher.user.email,
    },
    group: teacher.group
      ? {
          id: teacher.group.id,
          name: teacher.group.name,
          ageRange: teacher.group.ageRange,
          capacity: teacher.group.capacity,
        }
      : null,
    stats: {
      totalStudents,
      presentToday,
      absentToday,
      sickToday,
      notMarked,
      attendanceRate,
    },
    weeklyAttendance,
    students: students.map(s => ({
      id: s.id,
      firstname: s.firstname,
      lastname: s.lastname,
      todayStatus: s.attendances[0]?.status ?? null,
    })),
  }
}
