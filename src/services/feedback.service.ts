import { prisma } from '@/lib/prisma'

export async function findTeacherFeedbacks(teacherId: number, page = 1, pageSize = 20) {
  return prisma.feedback.findMany({
    where: { teacherId },
    select: {
      id: true,
      parentId: true,
      teacherId: true,
      message: true,
      reply: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      parent: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findAllFeedbacks(page = 1, pageSize = 20) {
  return prisma.feedback.findMany({
    select: {
      id: true,
      parentId: true,
      teacherId: true,
      message: true,
      reply: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      parent: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
      teacher: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function replyToFeedback(id: number, reply: string) {
  return prisma.feedback.update({
    where: { id },
    data: { reply, status: 'REPLIED', updatedAt: new Date() },
    select: {
      id: true,
      parent: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
      teacher: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
    },
  })
}

export async function updateFeedbackStatus(id: number, status: 'RESOLVED') {
  return prisma.feedback.update({
    where: { id },
    data: { status },
  })
}

export async function createFeedback(data: {
  parentId: number
  teacherId: number
  message: string
}) {
  return prisma.feedback.create({
    data: { ...data, status: 'PENDING' },
  })
}

export async function findParentFeedbacks(parentId: number, page = 1, pageSize = 20) {
  return prisma.feedback.findMany({
    where: { parentId },
    select: {
      id: true,
      parentId: true,
      teacherId: true,
      message: true,
      reply: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}
