import { prisma } from '@/lib/prisma'

function monthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

export type PaymentRow = {
  studentId: number
  studentFirstname: string
  studentLastname: string
  groupName: string | null
  parentId: number | null
  parentFirstname: string | null
  parentLastname: string | null
  parentUserId: number | null
  paymentId: number | null
  amount: number | null
  status: string
  dueDate: Date | null
}

export async function findPaymentsForMonth(year: number, month: number): Promise<PaymentRow[]> {
  const { start, end } = monthBounds(year, month)

  const students = await prisma.student.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      group: { select: { name: true } },
      parent: {
        select: {
          id: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
      payments: {
        where: { dueDate: { gte: start, lte: end } },
        select: { id: true, amount: true, status: true, dueDate: true },
        take: 1,
      },
    },
    orderBy: [{ group: { name: 'asc' } }, { lastname: 'asc' }],
  })

  return students.map((s) => {
    const pay = s.payments[0] ?? null
    return {
      studentId: s.id,
      studentFirstname: s.firstname,
      studentLastname: s.lastname,
      groupName: s.group?.name ?? null,
      parentId: s.parent?.id ?? null,
      parentFirstname: s.parent?.user.firstname ?? null,
      parentLastname: s.parent?.user.lastname ?? null,
      parentUserId: s.parent?.user.id ?? null,
      paymentId: pay?.id ?? null,
      amount: pay ? Number(pay.amount) : null,
      status: pay?.status ?? 'Хүлээгдэж буй',
      dueDate: pay?.dueDate ?? null,
    }
  })
}

export async function findPaymentsForMonthByTeacher(
  teacherId: number,
  year: number,
  month: number
): Promise<PaymentRow[]> {
  const { start, end } = monthBounds(year, month)

  const students = await prisma.student.findMany({
    where: { status: 'ACTIVE', group: { teacherId } },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      group: { select: { name: true } },
      parent: {
        select: {
          id: true,
          user: { select: { id: true, firstname: true, lastname: true } },
        },
      },
      payments: {
        where: { dueDate: { gte: start, lte: end } },
        select: { id: true, amount: true, status: true, dueDate: true },
        take: 1,
      },
    },
    orderBy: { lastname: 'asc' },
  })

  return students.map((s) => {
    const pay = s.payments[0] ?? null
    return {
      studentId: s.id,
      studentFirstname: s.firstname,
      studentLastname: s.lastname,
      groupName: s.group?.name ?? null,
      parentId: s.parent?.id ?? null,
      parentFirstname: s.parent?.user.firstname ?? null,
      parentLastname: s.parent?.user.lastname ?? null,
      parentUserId: s.parent?.user.id ?? null,
      paymentId: pay?.id ?? null,
      amount: pay ? Number(pay.amount) : null,
      status: pay?.status ?? 'Хүлээгдэж буй',
      dueDate: pay?.dueDate ?? null,
    }
  })
}

export async function findChildrenPaymentsForMonth(parentId: number, year: number, month: number) {
  const { start, end } = monthBounds(year, month)

  return prisma.student.findMany({
    where: { parentId, status: 'ACTIVE' },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      group: { select: { name: true } },
      payments: {
        where: { dueDate: { gte: start, lte: end } },
        select: { id: true, amount: true, status: true, dueDate: true },
        take: 1,
      },
    },
  })
}

export async function upsertPaymentPaid(
  studentId: number,
  parentId: number,
  year: number,
  month: number,
  amount: number
) {
  const { start, end } = monthBounds(year, month)
  const dueDate = new Date(year, month, 0) // last day of the month

  const existing = await prisma.payment.findFirst({
    where: { studentId, dueDate: { gte: start, lte: end } },
  })

  if (existing) {
    return prisma.payment.update({
      where: { id: existing.id },
      data: { status: 'Төлсөн', date: new Date() },
    })
  }

  return prisma.payment.create({
    data: {
      studentId,
      parentId,
      amount,
      date: new Date(),
      dueDate,
      status: 'Төлсөн',
    },
  })
}
