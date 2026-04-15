'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import {
  findAllUsers,
  updateUserCredentials,
  setUserArchived,
  deleteUserById,
} from '@/services/admin.service'
import { checkUserUsernameExists } from '@/services/teacher.service'

export async function getAllUsers() {
  return findAllUsers()
}

export async function updateUserCreds(
  id: number,
  data: { username: string; password?: string }
) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  // Check username uniqueness (exclude current user)
  const existing = await checkUserUsernameExists(data.username)
  if (existing && existing.id !== id) throw new Error('Нэвтрэх нэр аль хэдийн бүртгэлтэй байна')

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined
  await updateUserCredentials(id, { username: data.username, passwordHash })

  revalidatePath('/admin/users')
}

export async function toggleUserActive(id: number, currentlyArchived: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  // Prevent self-deactivation
  const myId = Number((session.user as any).id)
  if (myId === id) throw new Error('Өөрийгөө идэвхгүй болгох боломжгүй')

  await setUserArchived(id, !currentlyArchived)
  revalidatePath('/admin/users')
}

export async function deleteUser(id: number) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const myId = Number((session.user as any).id)
  if (myId === id) throw new Error('Өөрийгөө устгах боломжгүй')

  await deleteUserById(id)
  revalidatePath('/admin/users')
}
