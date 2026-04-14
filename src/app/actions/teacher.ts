'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import bcrypt from 'bcryptjs'
import {
  findTeachers,
  checkUserEmailExists,
  checkUserUsernameExists,
  createTeacherWithUser,
  updateTeacherById,
  archiveTeacherById,
} from '@/services/teacher.service'

export const getTeachers = unstable_cache(
  () => findTeachers(),
  ['teachers'],
  { tags: ['teachers'], revalidate: 300 }
)

export async function createTeacher(data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  username: string
  password: string
  profession: string
}) {
  const [existingEmail, existingUsername] = await Promise.all([
    checkUserEmailExists(data.email),
    checkUserUsernameExists(data.username),
  ])

  if (existingEmail) throw new Error('И-мэйл аль хэдийн бүртгэлтэй байна')
  if (existingUsername) throw new Error('Нэвтрэх нэр аль хэдийн бүртгэлтэй байна')

  const hashed = await bcrypt.hash(data.password, 10)
  await createTeacherWithUser({ ...data, password: hashed })
  revalidateTag('teachers')
  revalidatePath('/admin/teachers')
}

export async function updateTeacher(id: number, data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  profession: string
}) {
  await updateTeacherById(id, data)
  revalidateTag('teachers')
  revalidatePath('/admin/teachers')
}

export async function archiveTeacher(id: number) {
  await archiveTeacherById(id)
  revalidateTag('teachers')
  revalidatePath('/admin/teachers')
}
