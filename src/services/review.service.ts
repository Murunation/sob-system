import { prisma } from '@/lib/prisma'

export async function findStudentReviews(studentId: number, page = 1, pageSize = 20) {
  return prisma.review.findMany({
    where: { studentId },
    select: {
      id: true,
      studentId: true,
      teacherId: true,
      behavior: true,
      development: true,
      note: true,
      status: true,
      readAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findTeacherReviews(teacherId: number, page = 1, pageSize = 20) {
  return prisma.review.findMany({
    where: { teacherId },
    select: {
      id: true,
      studentId: true,
      teacherId: true,
      behavior: true,
      development: true,
      note: true,
      status: true,
      readAt: true,
      createdAt: true,
      updatedAt: true,
      student: { select: { id: true, firstname: true, lastname: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function findChildReviews(studentId: number, page = 1, pageSize = 20) {
  return prisma.review.findMany({
    where: {
      studentId,
      status: { in: ['SENT', 'READ'] },
    },
    select: {
      id: true,
      studentId: true,
      behavior: true,
      development: true,
      note: true,
      status: true,
      readAt: true,
      createdAt: true,
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function markReviewsAsRead(studentId: number) {
  return prisma.review.updateMany({
    where: { studentId, status: 'SENT' },
    data: { status: 'READ', readAt: new Date() },
  })
}

export async function createReview(data: {
  studentId: number
  teacherId: number
  behavior: string
  development: string
  note: string
  status: 'DRAFT' | 'SENT'
}) {
  return prisma.review.create({ data })
}

export async function updateReviewById(id: number, data: {
  behavior: string
  development: string
  note: string
  status: 'DRAFT' | 'SENT'
}) {
  return prisma.review.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
    select: {
      id: true,
      status: true,
      student: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          parent: { select: { id: true, userId: true } },
        },
      },
    },
  })
}

export async function findStudentWithParent(studentId: number) {
  return prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      parent: { select: { id: true, userId: true } },
    },
  })
}
