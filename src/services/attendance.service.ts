import { prisma } from '@/lib/prisma'

const attendanceWithStudentSelect = {
  id: true,
  studentId: true,
  teacherId: true,
  date: true,
  status: true,
  note: true,
  editedBy: true,
  editedAt: true,
  createdAt: true,
  student: {
    select: { id: true, firstname: true, lastname: true },
  },
} as const

export async function findAttendanceByTeacherAndDate(teacherId: number, date: string) {
  return prisma.attendance.findMany({
    where: {
      teacherId,
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      },
    },
    select: attendanceWithStudentSelect,
  })
}

export async function findAttendanceCountByDate(date: string) {
  return prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      },
    },
    select: { id: true, status: true, studentId: true },
  })
}

export async function upsertAttendanceRecord(record: {
  studentId: number
  teacherId: number
  date: string
  dateObj: Date
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'
  note?: string | null
  editedBy?: string | null
}) {
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId: record.studentId,
      date: {
        gte: new Date(record.date + 'T00:00:00.000Z'),
        lte: new Date(record.date + 'T23:59:59.999Z'),
      },
    },
    select: { id: true },
  })

  if (existing) {
    return prisma.attendance.update({
      where: { id: existing.id },
      data: {
        status: record.status,
        note: record.note ?? null,
        editedBy: record.editedBy ?? null,
        editedAt: new Date(),
      },
    })
  }

  return prisma.attendance.create({
    data: {
      studentId: record.studentId,
      teacherId: record.teacherId,
      date: record.dateObj,
      status: record.status,
      note: record.note ?? null,
    },
  })
}

export async function findAttendanceHistory(groupId: number, page = 1, pageSize = 50) {
  return prisma.attendance.findMany({
    where: { student: { groupId } },
    select: attendanceWithStudentSelect,
    orderBy: { date: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findAllAttendanceByDate(date: string) {
  return prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      },
    },
    select: attendanceWithStudentSelect,
    orderBy: { student: { firstname: 'asc' } },
  })
}

export async function updateAttendanceById(id: number, data: {
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'
  note?: string | null
  editedBy?: string | null
}) {
  return prisma.attendance.update({
    where: { id },
    data: {
      status: data.status,
      note: data.note ?? null,
      editedBy: data.editedBy ?? null,
      editedAt: new Date(),
    },
  })
}
