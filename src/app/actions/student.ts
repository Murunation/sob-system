'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Бүх хүүхэд авах
export async function getStudents() {
  return await prisma.student.findMany({
    where: { status: 'ACTIVE' },
    include: {
      group: true,
      parent: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Архивласан хүүхэд авах
export async function getArchivedStudents() {
  return await prisma.student.findMany({
    where: { status: 'ARCHIVED' },
    include: {
      group: true,
      parent: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Хүүхэд нэмэх
export async function createStudent(data: {
  firstname: string
  lastname: string
  birthDate: string
  groupId: number
  parentId: number
  healthInfo?: string
}) {
  await prisma.student.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      birthDate: new Date(data.birthDate),
      groupId: data.groupId,
      parentId: data.parentId,
      healthInfo: data.healthInfo || null,
      status: 'ACTIVE'
    }
  })
  revalidatePath('/admin/students')
}

// Хүүхэд засах
export async function updateStudent(id: number, data: {
  firstname: string
  lastname: string
  birthDate: string
  groupId: number
  parentId: number
  healthInfo?: string
}) {
  await prisma.student.update({
    where: { id },
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      birthDate: new Date(data.birthDate),
      groupId: data.groupId,
      parentId: data.parentId,
      healthInfo: data.healthInfo || null,
    }
  })
  revalidatePath('/admin/students')
}

// Хүүхэд архивлах
export async function archiveStudent(id: number) {
  await prisma.student.update({
    where: { id },
    data: { status: 'ARCHIVED' }
  })
  revalidatePath('/admin/students')
}

// Хүүхэд сэргээх
export async function restoreStudent(id: number) {
  await prisma.student.update({
    where: { id },
    data: { status: 'ACTIVE' }
  })
  revalidatePath('/admin/students')
}