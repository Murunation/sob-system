import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

function todayBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { now, start, end }
}

// ── Pickup QR token ────────────────────────────────────────────────────────

export async function getOrCreatePickupToken(teacherId: number) {
  const { now, start, end } = todayBounds()

  const existing = await prisma.pickupToken.findFirst({
    where: {
      teacherId,
      date: { gte: start, lte: end },
      expiresAt: { gt: now },
    },
    select: { token: true, expiresAt: true },
  })

  if (existing) return existing

  return prisma.pickupToken.create({
    data: {
      token: randomUUID(),
      teacherId,
      date: now,
      expiresAt: end,
    },
    select: { token: true, expiresAt: true },
  })
}

export async function validatePickupToken(token: string) {
  const { now } = todayBounds()
  return prisma.pickupToken.findFirst({
    where: { token, expiresAt: { gt: now } },
    select: {
      id: true,
      teacherId: true,
      teacher: {
        select: {
          id: true,
          group: { select: { id: true, name: true } },
        },
      },
    },
  })
}

// ── Record pickup ──────────────────────────────────────────────────────────

export async function recordPickup(studentIds: number[], parentId: number, teacherId: number) {
  const { start, end } = todayBounds()

  const existing = await prisma.childPickup.findMany({
    where: {
      studentId: { in: studentIds },
      pickedUpAt: { gte: start, lte: end },
    },
    select: { studentId: true },
  })

  const alreadyPickedIds = new Set(existing.map((e) => e.studentId))
  const toRecord = studentIds.filter((id) => !alreadyPickedIds.has(id))

  if (toRecord.length > 0) {
    await prisma.childPickup.createMany({
      data: toRecord.map((studentId) => ({ studentId, parentId, teacherId })),
    })
  }

  return { recorded: toRecord.length, alreadyRecorded: alreadyPickedIds.size }
}

// ── Get today's pickup status for teacher ─────────────────────────────────

export async function getTodayPickupStatus(teacherId: number) {
  const { start, end } = todayBounds()

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      group: {
        select: {
          students: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              parent: { select: { id: true, user: { select: { firstname: true, lastname: true } } } },
            },
          },
        },
      },
    },
  })

  const students = teacher?.group?.students ?? []

  const pickups = await prisma.childPickup.findMany({
    where: {
      teacherId,
      pickedUpAt: { gte: start, lte: end },
    },
    select: {
      studentId: true,
      pickedUpAt: true,
      parent: { select: { user: { select: { firstname: true, lastname: true } } } },
    },
  })

  const pickupMap = new Map(pickups.map((p) => [p.studentId, p]))

  return students.map((s) => {
    const pickup = pickupMap.get(s.id)
    return {
      id: s.id,
      firstname: s.firstname,
      lastname: s.lastname,
      pickedUp: !!pickup,
      pickedUpAt: pickup?.pickedUpAt ?? null,
      pickedUpBy: pickup
        ? `${pickup.parent.user.lastname} ${pickup.parent.user.firstname}`
        : null,
    }
  })
}

// ── Teacher confirms all children handed over ─────────────────────────────

export async function confirmAllPickedUp(teacherId: number) {
  const { start, end, now } = todayBounds()

  const existing = await prisma.pickupSession.findFirst({
    where: { teacherId, date: { gte: start, lte: end } },
  })
  if (existing) return existing

  // Create session
  const session = await prisma.pickupSession.create({
    data: { teacherId, date: now },
    include: { teacher: { select: { user: { select: { firstname: true, lastname: true } } } } },
  })

  // Notify all admins
  const admins = await prisma.admin.findMany({ select: { userId: true } })
  if (admins.length > 0) {
    const teacherName = `${session.teacher.user.lastname} ${session.teacher.user.firstname}`
    const time = now.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.userId,
        title: 'Бүх хүүхэд хүлээлгэж өгөгдлөө',
        message: `${teacherName} багш ${time} цагт бүх хүүхдийг хүлээлгэж өглөө.`,
        link: '/admin/pickup-log',
      })),
    })
  }

  return session
}

// ── Admin: get all pickup sessions ────────────────────────────────────────

export async function getPickupSessions() {
  return prisma.pickupSession.findMany({
    orderBy: { completedAt: 'desc' },
    take: 50,
    include: {
      teacher: {
        select: {
          user: { select: { firstname: true, lastname: true } },
          group: { select: { name: true } },
        },
      },
    },
  })
}
