'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTeacherByEmail } from '@/services/teacher.service'
import { findParentByEmail } from '@/services/parent.service'
import {
  findPaymentsForMonth,
  findPaymentsForMonthByTeacher,
  findChildrenPaymentsForMonth,
  upsertPaymentPaid,
} from '@/services/payment.service'
import { notifyParentPaymentReminder } from '@/app/actions/notification'

export async function getAdminPayments(year: number, month: number) {
  return findPaymentsForMonth(year, month)
}

export async function getTeacherPayments(year: number, month: number) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) return []

  return findPaymentsForMonthByTeacher(teacher.id, year, month)
}

export async function getParentChildrenPayments(year: number, month: number) {
  const session = await getServerSession(authOptions)
  if (!session) return []

  const parent = await findParentByEmail(session.user.email!)
  if (!parent) return []

  return findChildrenPaymentsForMonth(parent.id, year, month)
}

export async function sendPaymentReminder(
  parentUserId: number,
  studentName: string,
  monthLabel: string
) {
  await notifyParentPaymentReminder(parentUserId, studentName, monthLabel)
}

export async function payForStudents(
  studentIds: number[],
  year: number,
  month: number,
  amount: number
) {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false }

  const parent = await findParentByEmail(session.user.email!)
  if (!parent) return { ok: false }

  await Promise.all(
    studentIds.map((sid) => upsertPaymentPaid(sid, parent.id, year, month, amount))
  )

  return { ok: true }
}
