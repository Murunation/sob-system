'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Багшийн бүлгийн хүүхдүүд авах
export async function getMyGroupStudents() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { group: { include: { students: true } } }
  })

  return teacher?.group?.students || []
}

// Тухайн өдрийн ирц авах (багшид зориулсан)
export async function getAttendanceByDate(date: string) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
  })
  if (!teacher) return []

  return await prisma.attendance.findMany({
    where: {
      teacherId: teacher.id,
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    },
    include: { student: true }
  })
}

// Тогоочид зориулсан — бүх бүлгийн ирцийн тоо авах
export async function getAttendanceCountByDate(date: string) {
  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      }
    }
  })
}

// Ирц хадгалах
export async function saveAttendance(data: {
  date: string
  records: {
    studentId: number
    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'
    note?: string
  }[]
}) {
  const session = await getServerSession(authOptions)
  if (!session) return

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } }
  })
  if (!teacher) return

  const dateObj = new Date(data.date + 'T12:00:00.000Z')

  for (const record of data.records) {
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: record.studentId,
        date: {
          gte: new Date(data.date + 'T00:00:00.000Z'),
          lte: new Date(data.date + 'T23:59:59.999Z'),
        }
      }
    })

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: record.status,
          note: record.note || null,
          editedBy: session.user.email,
          editedAt: new Date(),
        }
      })
    } else {
      await prisma.attendance.create({
        data: {
          studentId: record.studentId,
          teacherId: teacher.id,
          date: dateObj,
          status: record.status,
          note: record.note || null,
        }
      })
    }
  }

  revalidatePath('/teacher/attendance')
}

// Ирцийн түүх авах
export async function getAttendanceHistory() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { group: true }
  })
  if (!teacher?.group) return []

  return await prisma.attendance.findMany({
    where: {
      student: { groupId: teacher.group.id }
    },
    include: { student: true },
    orderBy: { date: 'desc' },
    take: 100
  })
}