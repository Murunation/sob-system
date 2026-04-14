import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// ── Helpers ────────────────────────────────────────────────────────────────

function todayBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  return { now, start, end, noon }
}

// ── QR token ───────────────────────────────────────────────────────────────

/**
 * Багшид өнөөдрийн token буцаана.
 * Байхгүй бол шинэ үүсгэнэ; байгаа бол хуучныг буцаана.
 */
export async function getOrCreateTodayToken(teacherId: number) {
  const { now, start, end } = todayBounds()

  const existing = await prisma.qrToken.findFirst({
    where: {
      teacherId,
      date: { gte: start, lte: end },
      expiresAt: { gt: now },
    },
    select: { token: true, expiresAt: true },
  })

  if (existing) return existing

  return prisma.qrToken.create({
    data: {
      token: randomUUID(),
      teacherId,
      date: now,
      expiresAt: end,
    },
    select: { token: true, expiresAt: true },
  })
}

/**
 * Token хүчинтэй эсэхийг шалгаж, хамаарах багш + бүлгийг буцаана.
 * Хугацаа дууссан эсвэл олдоогүй бол null.
 */
export async function validateToken(token: string) {
  const { now } = todayBounds()
  return prisma.qrToken.findFirst({
    where: {
      token,
      expiresAt: { gt: now },
    },
    select: {
      id: true,
      teacherId: true,
      teacher: {
        select: {
          id: true,
          group: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
}

// ── Attendance ─────────────────────────────────────────────────────────────

/**
 * QR уншуулсны дараа хүүхдийн ирц бүртгэнэ.
 * Өнөөдөр аль хэдийн бүртгэгдсэн бол алгасна (давхар бүртгэлгүй).
 */
export async function recordQRAttendance(studentIds: number[], teacherId: number) {
  const { start, end, noon } = todayBounds()

  const existing = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
      date: { gte: start, lte: end },
    },
    select: { studentId: true },
  })

  const alreadyRecordedIds = new Set(existing.map((e) => e.studentId))
  const toRecord = studentIds.filter((id) => !alreadyRecordedIds.has(id))

  if (toRecord.length > 0) {
    await prisma.attendance.createMany({
      data: toRecord.map((studentId) => ({
        studentId,
        teacherId,
        date: noon,
        status: 'PRESENT' as const,
      })),
    })
  }

  return {
    recorded: toRecord.length,
    alreadyRecorded: alreadyRecordedIds.size,
  }
}
