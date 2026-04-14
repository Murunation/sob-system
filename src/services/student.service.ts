import { prisma } from '@/lib/prisma'

const studentSelect = {
  id: true,
  firstname: true,
  lastname: true,
  birthDate: true,
  groupId: true,
  parentId: true,
  status: true,
  healthInfo: true,
  createdAt: true,
  updatedAt: true,
  group: {
    select: { id: true, name: true }
  },
  parent: {
    select: {
      id: true,
      userId: true,
      user: {
        select: { id: true, firstname: true, lastname: true, phone: true }
      }
    }
  }
} as const

export async function findStudents(page = 1, pageSize = 50) {
  return prisma.student.findMany({
    where: { status: 'ACTIVE' },
    select: studentSelect,
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findArchivedStudents(page = 1, pageSize = 50) {
  return prisma.student.findMany({
    where: { status: 'ARCHIVED' },
    select: studentSelect,
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function createStudent(data: {
  firstname: string
  lastname: string
  birthDate: Date
  groupId: number
  healthInfo?: string | null
}) {
  return prisma.student.create({
    data: { ...data, parentId: null },
  })
}

export async function updateStudent(id: number, data: {
  firstname: string
  lastname: string
  birthDate: Date
  groupId: number
  healthInfo?: string | null
}) {
  return prisma.student.update({ where: { id }, data })
}

export async function setStudentParent(studentId: number, parentId: number) {
  return prisma.student.update({
    where: { id: studentId },
    data: { parentId },
  })
}

export async function setStudentStatus(id: number, status: 'ACTIVE' | 'ARCHIVED') {
  return prisma.student.update({ where: { id }, data: { status } })
}
