'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getMyNotifications() {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return []

  return await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions)
  if (!session) return 0

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return 0

  return await prisma.notification.count({
    where: { userId: user.id, isRead: false }
  })
}

export async function markAsRead(id: number) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  })
  revalidatePath('/')
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions)
  if (!session) return

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true }
  })
  revalidatePath('/')
}

export async function createNotification(data: {
  userId: number
  title: string
  message: string
  link?: string
}) {
  await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      link: data.link || null,
    }
  })
}

// ==========================================
// Тодорхой үйлдэлд notification явуулах
// ==========================================

// Санал хүсэлт илгээхэд багшид мэдэгдэх
export async function notifyTeacherNewFeedback(teacherUserId: number, parentName: string) {
  await createNotification({
    userId: teacherUserId,
    title: 'Шинэ санал хүсэлт',
    message: `${parentName} санал хүсэлт илгээлээ`,
    link: '/teacher/feedback',
  })
}

// Санал хүсэлтэд хариу өгөхөд эцэг эхэд мэдэгдэх
export async function notifyParentFeedbackReplied(parentUserId: number, teacherName: string) {
  await createNotification({
    userId: parentUserId,
    title: 'Санал хүсэлтэд хариу ирлээ',
    message: `${teacherName} таны санал хүсэлтэд хариу өглөө`,
    link: '/parent/feedback',
  })
}

// Тайлан илгээхэд админд мэдэгдэх
export async function notifyAdminNewReport(adminUserId: number, reportType: string) {
  await createNotification({
    userId: adminUserId,
    title: 'Шинэ тайлан ирлээ',
    message: `${reportType} илгээгдлээ`,
    link: '/admin/reports',
  })
}

// Тайлан батлах/буцаахад мэдэгдэх
export async function notifyReportStatus(userId: number, reportType: string, status: 'CONFIRMED' | 'RETURNED') {
  await createNotification({
    userId,
    title: status === 'CONFIRMED' ? 'Тайлан баталгаажлаа' : 'Тайлан буцаагдлаа',
    message: `${reportType} ${status === 'CONFIRMED' ? 'баталгаажсан' : 'буцаагдсан'}`,
    link: '/teacher/reports',
  })
}

// Review нэмэхэд эцэг эхэд мэдэгдэх
export async function notifyParentNewReview(parentUserId: number, studentName: string) {
  await createNotification({
    userId: parentUserId,
    title: 'Шинэ үнэлгээ нэмэгдлээ',
    message: `${studentName}-ийн хөгжлийн үнэлгээ нэмэгдлээ`,
    link: '/parent/reviews',
  })
}

// 7 хоногийн төлөвлөгөө нэмэхэд эцэг эхэд мэдэгдэх
export async function notifyParentNewWeeklyPlan(parentUserIds: number[], teacherName: string) {
  for (const userId of parentUserIds) {
    await createNotification({
      userId,
      title: 'Шинэ 7 хоногийн төлөвлөгөө',
      message: `${teacherName} шинэ төлөвлөгөө оруулсан`,
      link: '/parent/weekly-plan',
    })
  }
}

// Санал хүсэлт болон хариуг админд мэдэгдэх
export async function notifyAdminNewFeedback(adminUserId: number, parentName: string, teacherName: string) {
  await createNotification({
    userId: adminUserId,
    title: 'Санал хүсэлт',
    message: `${parentName} → ${teacherName} санал хүсэлт илгээлээ`,
    link: '/admin/feedback',
  })
}