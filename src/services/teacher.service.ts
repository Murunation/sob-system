import { prisma } from '@/lib/prisma'

const teacherListSelect = {
  id: true,
  userId: true,
  profession: true,
  isArchived: true,
  user: {
    select: { id: true, firstname: true, lastname: true, phone: true, email: true, username: true }
  },
  group: {
    select: { id: true, name: true }
  }
} as const

export async function findTeachers() {
  return prisma.teacher.findMany({
    where: { isArchived: false },
    select: teacherListSelect,
    orderBy: { id: 'asc' },
  })
}

export async function findTeacherByEmail(email: string) {
  return prisma.teacher.findFirst({
    where: { user: { email } },
    select: { id: true, userId: true, profession: true },
  })
}

export async function findTeacherWithGroup(email: string) {
  return prisma.teacher.findFirst({
    where: { user: { email } },
    select: {
      id: true,
      group: { select: { id: true } },
    },
  })
}

export async function findTeacherWithGroupStudents(email: string) {
  return prisma.teacher.findFirst({
    where: { user: { email } },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, firstname: true, lastname: true } },
      group: {
        select: {
          id: true,
          students: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              parentId: true,
              parent: {
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

export async function checkUserEmailExists(email: string) {
  return prisma.user.findUnique({ where: { email }, select: { id: true } })
}

export async function checkUserUsernameExists(username: string) {
  return prisma.user.findUnique({ where: { username }, select: { id: true } })
}

export async function createTeacherWithUser(data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  username: string
  password: string
  profession: string
}) {
  return prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      email: data.email,
      username: data.username,
      password: data.password,
      role: 'TEACHER',
      teacher: { create: { profession: data.profession } },
    },
  })
}

export async function updateTeacherById(id: number, data: {
  firstname: string
  lastname: string
  phone: string
  email: string
  profession: string
}) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!teacher) return null

  return Promise.all([
    prisma.user.update({
      where: { id: teacher.userId },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
        email: data.email,
      },
    }),
    prisma.teacher.update({
      where: { id },
      data: { profession: data.profession },
    }),
  ])
}

export async function archiveTeacherById(id: number) {
  return prisma.teacher.update({
    where: { id },
    data: { isArchived: true },
  })
}

export async function restoreTeacherById(id: number) {
  return prisma.teacher.update({
    where: { id },
    data: { isArchived: false },
  })
}
