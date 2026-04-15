'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  findNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification as dbCreateNotification,
  createManyNotifications,
} from '@/services/notification.service'

export async function getMyNotifications(page = 1, pageSize = 20) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  return findNotifications(session.user.email!, page, pageSize)
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions)
  if (!session) return 0

  return countUnreadNotifications(session.user.email!)
}

export async function markAsRead(id: number) {
  await markNotificationRead(id)
  revalidatePath('/')
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions)
  if (!session) return

  await markAllNotificationsRead(session.user.email!)
  revalidatePath('/')
}

export async function createNotification(data: {
  userId: number
  title: string
  message: string
  link?: string
}) {
  await dbCreateNotification(data)
}

// ==========================================
// Тодорхой үйлдэлд notification явуулах
// ==========================================

export async function notifyTeacherNewFeedback(teacherUserId: number, parentName: string) {
  await dbCreateNotification({
    userId: teacherUserId,
    title: 'Шинэ санал хүсэлт',
    message: `${parentName} санал хүсэлт илгээлээ`,
    link: '/teacher/feedback',
  })
}

export async function notifyParentFeedbackReplied(parentUserId: number, teacherName: string) {
  await dbCreateNotification({
    userId: parentUserId,
    title: 'Санал хүсэлтэд хариу ирлээ',
    message: `${teacherName} таны санал хүсэлтэд хариу өглөө`,
    link: '/parent/feedback',
  })
}

export async function notifyAdminNewReport(adminUserId: number, reportType: string) {
  await dbCreateNotification({
    userId: adminUserId,
    title: 'Шинэ тайлан ирлээ',
    message: `${reportType} илгээгдлээ`,
    link: '/admin/reports',
  })
}

export async function notifyReportStatus(userId: number, reportType: string, status: 'CONFIRMED' | 'RETURNED') {
  await dbCreateNotification({
    userId,
    title: status === 'CONFIRMED' ? 'Тайлан баталгаажлаа' : 'Тайлан буцаагдлаа',
    message: `${reportType} ${status === 'CONFIRMED' ? 'баталгаажсан' : 'буцаагдсан'}`,
    link: '/teacher/reports',
  })
}

export async function notifyParentNewReview(parentUserId: number, studentName: string) {
  await dbCreateNotification({
    userId: parentUserId,
    title: 'Шинэ үнэлгээ нэмэгдлээ',
    message: `${studentName}-ийн хөгжлийн үнэлгээ нэмэгдлээ`,
    link: '/parent/reviews',
  })
}

export async function notifyParentNewWeeklyPlan(parentUserIds: number[], teacherName: string) {
  await createManyNotifications(parentUserIds, {
    title: 'Шинэ 7 хоногийн төлөвлөгөө',
    message: `${teacherName} шинэ төлөвлөгөө оруулсан`,
    link: '/parent/weekly-plan',
  })
}

export async function notifyAdminNewFeedback(adminUserId: number, parentName: string, teacherName: string) {
  await dbCreateNotification({
    userId: adminUserId,
    title: 'Санал хүсэлт',
    message: `${parentName} → ${teacherName} санал хүсэлт илгээлээ`,
    link: '/admin/feedback',
  })
}

export async function notifyParentPaymentReminder(parentUserId: number, studentName: string, monthLabel: string) {
  await dbCreateNotification({
    userId: parentUserId,
    title: 'Төлбөрийн сануулга',
    message: `${studentName}-ийн ${monthLabel}-ын төлбөр төлөгдөөгүй байна`,
    link: '/parent/payment',
  })
}
