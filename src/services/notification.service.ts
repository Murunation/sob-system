import { prisma } from '@/lib/prisma'

export async function findNotifications(email: string, page = 1, pageSize = 20) {
  return prisma.notification.findMany({
    where: { user: { email } },
    select: {
      id: true,
      userId: true,
      title: true,
      message: true,
      link: true,
      isRead: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })
}

export async function countUnreadNotifications(email: string) {
  return prisma.notification.count({
    where: { user: { email }, isRead: false },
  })
}

export async function markNotificationRead(id: number) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
}

export async function markAllNotificationsRead(email: string) {
  return prisma.notification.updateMany({
    where: { user: { email }, isRead: false },
    data: { isRead: true },
  })
}

export async function createNotification(data: {
  userId: number
  title: string
  message: string
  link?: string | null
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
    },
  })
}

export async function createManyNotifications(
  userIds: number[],
  payload: { title: string; message: string; link?: string | null }
) {
  if (userIds.length === 0) return
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
    })),
  })
}
