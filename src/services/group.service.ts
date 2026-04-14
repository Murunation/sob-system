import { prisma } from '@/lib/prisma'

export async function findGroups() {
  return prisma.group.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      name: true,
      ageRange: true,
      capacity: true,
      isArchived: true,
      teacherId: true,
      createdAt: true,
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createGroup(data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  return prisma.group.create({ data })
}

export async function updateGroup(id: number, data: {
  name: string
  ageRange: string
  capacity: number
  teacherId?: number
}) {
  return prisma.group.update({ where: { id }, data })
}

export async function archiveGroup(id: number) {
  return prisma.group.update({
    where: { id },
    data: { isArchived: true },
  })
}
