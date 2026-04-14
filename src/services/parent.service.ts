import { prisma } from '@/lib/prisma'

export async function findParentByPhone(phone: string) {
  return prisma.parent.findFirst({
    where: { user: { phone } },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, firstname: true, lastname: true, phone: true } },
    },
  })
}

export async function createParentWithUser(data: {
  firstname: string
  lastname: string
  phone: string
  email?: string | null
  username: string
  passwordHash: string
}) {
  return prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email ?? `${data.username}@parent.local`,
      username: data.username,
      password: data.passwordHash,
      role: 'PARENT',
      profileCompleted: false,
      parent: { create: {} },
    },
    select: {
      parent: { select: { id: true } },
    },
  })
}

export async function findParentByEmail(email: string) {
  return prisma.parent.findFirst({
    where: { user: { email } },
    select: { id: true, userId: true },
  })
}

export async function findParentWithStudents(email: string) {
  return prisma.parent.findFirst({
    where: { user: { email } },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, firstname: true, lastname: true } },
      students: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          groupId: true,
          parentId: true,
          group: {
            select: {
              id: true,
              name: true,
              teacher: {
                select: {
                  id: true,
                  userId: true,
                  user: { select: { id: true, firstname: true, lastname: true } },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function findParents() {
  return prisma.parent.findMany({
    select: {
      id: true,
      userId: true,
      address: true,
      user: {
        select: { id: true, firstname: true, lastname: true, phone: true, email: true },
      },
    },
    orderBy: { id: 'asc' },
  })
}

export async function findParentsFull() {
  return prisma.parent.findMany({
    where: { user: { isArchived: false } },
    select: {
      id: true,
      address: true,
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          phone: true,
          email: true,
          username: true,
          profileCompleted: true,
        },
      },
      students: {
        where: { status: 'ACTIVE' },
        select: { id: true, firstname: true, lastname: true },
      },
    },
    orderBy: { id: 'asc' },
  })
}

export async function updateParentById(
  parentId: number,
  data: {
    firstname: string
    lastname: string
    phone: string
    email?: string | null
    address?: string | null
  }
) {
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: { userId: true },
  })
  if (!parent) throw new Error('Эцэг эх олдсонгүй')

  await prisma.$transaction([
    prisma.user.update({
      where: { id: parent.userId },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone || undefined,
        ...(data.email ? { email: data.email } : {}),
      },
    }),
    prisma.parent.update({
      where: { id: parentId },
      data: { address: data.address ?? null },
    }),
  ])
}

export async function archiveParentById(parentId: number) {
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: { userId: true },
  })
  if (!parent) throw new Error('Эцэг эх олдсонгүй')
  await prisma.user.update({
    where: { id: parent.userId },
    data: { isArchived: true },
  })
}

export async function completeParentProfile(
  userId: number,
  data: { email: string; address?: string | null }
) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        profileCompleted: true,
      },
    }),
    prisma.parent.update({
      where: { userId },
      data: { address: data.address ?? null },
    }),
  ])
}

export async function findChildAttendance(studentId: number, page = 1, pageSize = 30) {
  return prisma.attendance.findMany({
    where: { studentId },
    select: {
      id: true,
      date: true,
      status: true,
      note: true,
    },
    orderBy: { date: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findChildPayments(studentId: number, page = 1, pageSize = 20) {
  return prisma.payment.findMany({
    where: { studentId },
    select: {
      id: true,
      studentId: true,
      parentId: true,
      amount: true,
      date: true,
      dueDate: true,
      status: true,
      createdAt: true,
    },
    orderBy: { date: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}
