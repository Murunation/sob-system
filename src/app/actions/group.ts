'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGroups() {
  return await prisma.group.findMany({
    where: { isArchived: false },
    include: { teacher: { include: { user: true } } },
    orderBy: { name: 'asc' }
  })
}

export async function createGroup(data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  await prisma.group.create({ data })
  revalidatePath('/admin/groups')
}

export async function updateGroup(id: number, data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  await prisma.group.update({ where: { id }, data })
  revalidatePath('/admin/groups')
}

export async function archiveGroup(id: number) {
  await prisma.group.update({
    where: { id },
    data: { isArchived: true }
  })
  revalidatePath('/admin/groups')
}