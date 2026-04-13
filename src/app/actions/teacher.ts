'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getTeachers() {
  return await prisma.teacher.findMany({
    where: { isArchived: false },
    include: {
      user: true,
      group: true,
    },
    orderBy: { id: 'asc' }
  })
}

export async function createTeacher(data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  username: string
  password: string
  profession: string
}) {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } })
  if (existingEmail) {
    throw new Error('И-мэйл аль хэдийн бүртгэлтэй байна')
  }

  const existingUsername = await prisma.user.findUnique({ where: { username: data.username } })
  if (existingUsername) {
    throw new Error('Нэвтрэх нэр аль хэдийн бүртгэлтэй байна')
  }

  const hashed = await bcrypt.hash(data.password, 10)
  await prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email,
      username: data.username,
      password: hashed,
      role: 'TEACHER',
      teacher: {
        create: {
          profession: data.profession,
        }
      }
    }
  })
  revalidatePath('/admin/teachers')
}

export async function updateTeacher(id: number, data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  profession: string
}) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true }
  })
  if (!teacher) return

  await prisma.user.update({
    where: { id: teacher.userId },
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email,
    }
  })
  await prisma.teacher.update({
    where: { id },
    data: { profession: data.profession }
  })
  revalidatePath('/admin/teachers')
}

export async function archiveTeacher(id: number) {
  await prisma.teacher.update({
    where: { id },
    data: { isArchived: true }
  })
  revalidatePath('/admin/teachers')
}