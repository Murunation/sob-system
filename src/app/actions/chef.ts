'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import bcrypt from 'bcryptjs'
import {
  findChefs,
  findArchivedChefs,
  findArchivedTeachers,
  createChefWithUser,
  updateChefById,
  archiveChefById,
  restoreChefById,
} from '@/services/chef.service'
import {
  findArchivedStudents,
  setStudentStatus,
} from '@/services/student.service'
import { archiveTeacherById, restoreTeacherById, checkUserEmailExists, checkUserUsernameExists } from '@/services/teacher.service'

// ── Chef CRUD ─────────────────────────────────────────────────────────────────

export const getChefs = unstable_cache(
  () => findChefs(),
  ['chefs'],
  { tags: ['chefs'], revalidate: 300 }
)

export async function createChef(data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  username: string
  password: string
}) {
  const [existingEmail, existingUsername] = await Promise.all([
    checkUserEmailExists(data.email),
    checkUserUsernameExists(data.username),
  ])

  if (existingEmail) throw new Error('И-мэйл аль хэдийн бүртгэлтэй байна')
  if (existingUsername) throw new Error('Нэвтрэх нэр аль хэдийн бүртгэлтэй байна')

  const hashed = await bcrypt.hash(data.password, 10)
  await createChefWithUser({ ...data, password: hashed })
  revalidateTag('chefs')
  revalidatePath('/admin/chefs')
}

export async function updateChef(
  id: number,
  data: { firstname: string; lastname: string; phone: string; email: string }
) {
  await updateChefById(id, data)
  revalidateTag('chefs')
  revalidatePath('/admin/chefs')
}

export async function archiveChef(id: number) {
  await archiveChefById(id)
  revalidateTag('chefs')
  revalidatePath('/admin/chefs')
  revalidatePath('/admin/archive')
}

// ── Archive queries ────────────────────────────────────────────────────────────

export async function getArchivedStudents() {
  return findArchivedStudents()
}

export async function getArchivedTeachers() {
  return findArchivedTeachers()
}

export async function getArchivedChefs() {
  return findArchivedChefs()
}

// ── Restore actions ───────────────────────────────────────────────────────────

export async function restoreStudentFromArchive(id: number) {
  await setStudentStatus(id, 'ACTIVE')
  revalidateTag('students')
  revalidatePath('/admin/students')
  revalidatePath('/admin/archive')
}

export async function restoreTeacherFromArchive(id: number) {
  await restoreTeacherById(id)
  revalidateTag('teachers')
  revalidatePath('/admin/teachers')
  revalidatePath('/admin/archive')
}

export async function restoreChefFromArchive(id: number) {
  await restoreChefById(id)
  revalidateTag('chefs')
  revalidatePath('/admin/chefs')
  revalidatePath('/admin/archive')
}
