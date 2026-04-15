import { prisma } from '@/lib/prisma'

const chefListSelect = {
  id: true,
  userId: true,
  isArchived: true,
  user: {
    select: { id: true, firstname: true, lastname: true, phone: true, email: true, username: true },
  },
} as const

export async function findChefs() {
  return prisma.chef.findMany({
    where: { isArchived: false },
    select: chefListSelect,
    orderBy: { id: 'asc' },
  })
}

export async function findArchivedChefs() {
  return prisma.chef.findMany({
    where: { isArchived: true },
    select: chefListSelect,
    orderBy: { id: 'asc' },
  })
}

export async function createChefWithUser(data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  username: string
  password: string
}) {
  return prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email,
      username: data.username,
      password: data.password,
      role: 'CHEF',
      chef: { create: {} },
    },
  })
}

export async function updateChefById(
  id: number,
  data: { firstname: string; lastname: string; phone: string; email: string }
) {
  const chef = await prisma.chef.findUnique({ where: { id }, select: { userId: true } })
  if (!chef) return null

  return prisma.user.update({
    where: { id: chef.userId },
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email,
    },
  })
}

export async function archiveChefById(id: number) {
  return prisma.chef.update({ where: { id }, data: { isArchived: true } })
}

export async function restoreChefById(id: number) {
  return prisma.chef.update({ where: { id }, data: { isArchived: false } })
}

export async function findArchivedTeachers() {
  return prisma.teacher.findMany({
    where: { isArchived: true },
    select: {
      id: true,
      userId: true,
      profession: true,
      isArchived: true,
      user: { select: { id: true, firstname: true, lastname: true, phone: true, email: true, username: true } },
      group: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  })
}
