'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import {
  findStudents,
  findArchivedStudents,
  createStudent as dbCreateStudent,
  updateStudent as dbUpdateStudent,
  setStudentStatus,
} from '@/services/student.service'

export const getStudents = unstable_cache(
  (page = 1, pageSize = 50) => findStudents(page, pageSize),
  ['students-active'],
  { tags: ['students'], revalidate: 60 }
)

export const getArchivedStudents = unstable_cache(
  (page = 1, pageSize = 50) => findArchivedStudents(page, pageSize),
  ['students-archived'],
  { tags: ['students'], revalidate: 60 }
)

export async function createStudent(data: {
  firstname: string
  lastname: string
  birthDate: string
  groupId: number
  healthInfo?: string
}) {
  await dbCreateStudent({
    firstname: data.firstname,
    lastname: data.lastname,
    birthDate: new Date(data.birthDate),
    groupId: data.groupId,
    healthInfo: data.healthInfo || null,
  })
  revalidateTag('students')
  revalidatePath('/admin/students')
  revalidatePath('/teacher/students')
}

export async function updateStudent(id: number, data: {
  firstname: string
  lastname: string
  birthDate: string
  groupId: number
  healthInfo?: string
}) {
  await dbUpdateStudent(id, {
    firstname: data.firstname,
    lastname: data.lastname,
    birthDate: new Date(data.birthDate),
    groupId: data.groupId,
    healthInfo: data.healthInfo || null,
  })
  revalidateTag('students')
  revalidatePath('/admin/students')
  revalidatePath('/teacher/students')
}

export async function archiveStudent(id: number) {
  await setStudentStatus(id, 'ARCHIVED')
  revalidateTag('students')
  revalidatePath('/admin/students')
  revalidatePath('/teacher/students')
}

export async function restoreStudent(id: number) {
  await setStudentStatus(id, 'ACTIVE')
  revalidateTag('students')
  revalidatePath('/admin/students')
  revalidatePath('/teacher/students')
}
