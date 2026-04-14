'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  findAttendanceByTeacherAndDate,
  findAttendanceCountByDate,
  upsertAttendanceRecord,
  findAttendanceHistory,
} from '@/services/attendance.service'
import {
  findTeacherByEmail,
  findTeacherWithGroupStudents,
  findTeacherWithGroup,
} from '@/services/teacher.service'

export async function getMyGroupStudents() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherWithGroupStudents(session.user.email!)
  return teacher?.group?.students || []
}

export async function getAttendanceByDate(date: string) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return []

  return findAttendanceByTeacherAndDate(teacher.id, date)
}

export async function getAttendanceCountByDate(date: string) {
  return findAttendanceCountByDate(date)
}

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

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return

  const dateObj = new Date(data.date + 'T12:00:00.000Z')

  await Promise.all(
    data.records.map((record) =>
      upsertAttendanceRecord({
        studentId: record.studentId,
        teacherId: teacher.id,
        date: data.date,
        dateObj,
        status: record.status,
        note: record.note || null,
        editedBy: session.user.email,
      })
    )
  )

  revalidatePath('/teacher/attendance')
}

export async function getAttendanceHistory(page = 1, pageSize = 50) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherWithGroup(session.user.email!)
  if (!teacher?.group) return []

  return findAttendanceHistory(teacher.group.id, page, pageSize)
}
