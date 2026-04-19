'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTeacherByEmail } from '@/services/teacher.service'
import { findParentWithStudents } from '@/services/parent.service'
import {
  getOrCreatePickupToken,
  validatePickupToken,
  recordPickup,
  getTodayPickupStatus,
  confirmAllPickedUp,
  getPickupSessions,
} from '@/services/pickup.service'

// ── Teacher: авалтын QR token авах ────────────────────────────────────────

export async function getTeacherPickupToken() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) throw new Error('Багш олдсонгүй')

  const result = await getOrCreatePickupToken(teacher.id)
  return { token: result.token, expiresAt: result.expiresAt.toISOString() }
}

// ── Teacher: өнөөдрийн авалтын статус авах ───────────────────────────────

export async function getPickupStatus() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) throw new Error('Багш олдсонгүй')

  return getTodayPickupStatus(teacher.id)
}

// ── Teacher: бүгдийг хүлээлгэж өгсөн ─────────────────────────────────────

export async function teacherConfirmAllPickedUp() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) throw new Error('Багш олдсонгүй')

  await confirmAllPickedUp(teacher.id)
  return { success: true }
}

// ── Parent: QR scan хийх (авалт) ─────────────────────────────────────────

export type PickupScanResult =
  | { success: true; alreadyRecorded: boolean; message: string; students: string[] }
  | { success: false; error: string; needsLogin?: boolean }
  | { success: 'select'; pendingStudents: { id: number; firstname: string; lastname: string }[]; token: string; teacherId: number }

export async function scanPickupToken(token: string): Promise<PickupScanResult> {
  const session = await getServerSession(authOptions)

  if (!session) return { success: false, error: 'Нэвтрээгүй байна', needsLogin: true }
  if ((session.user as any).role !== 'PARENT') {
    return { success: false, error: 'Зөвхөн асран хамгаалагч QR уншуулах боломжтой' }
  }

  const pickupToken = await validatePickupToken(token)
  if (!pickupToken) return { success: false, error: 'QR код хүчингүй эсвэл хугацаа дуусжээ' }

  const parent = await findParentWithStudents(session.user.email!)
  if (!parent) return { success: false, error: 'Асран хамгаалагч олдсонгүй' }

  const groupId = pickupToken.teacher.group?.id
  if (!groupId) return { success: false, error: 'Багшийн бүлэг тохируулагдаагүй байна' }

  const myStudentsInGroup = parent.students.filter((s) => s.groupId === groupId)
  if (myStudentsInGroup.length === 0) {
    return { success: false, error: 'Таны хүүхэд энэ бүлэгт байхгүй байна' }
  }

  if (myStudentsInGroup.length > 1) {
    return {
      success: 'select',
      pendingStudents: myStudentsInGroup.map((s) => ({ id: s.id, firstname: s.firstname, lastname: s.lastname })),
      token,
      teacherId: pickupToken.teacherId,
    }
  }

  return _recordAndReturn(myStudentsInGroup, parent.id, pickupToken.teacherId)
}

export async function recordPickupForStudents(
  token: string,
  studentIds: number[]
): Promise<Exclude<PickupScanResult, { success: 'select' }>> {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false, error: 'Нэвтрээгүй байна' }
  if ((session.user as any).role !== 'PARENT') {
    return { success: false, error: 'Зөвхөн асран хамгаалагч QR уншуулах боломжтой' }
  }

  const pickupToken = await validatePickupToken(token)
  if (!pickupToken) return { success: false, error: 'QR код хугацаа дуусжээ' }

  const parent = await findParentWithStudents(session.user.email!)
  if (!parent) return { success: false, error: 'Асран хамгаалагч олдсонгүй' }

  const myIds = new Set(parent.students.map((s) => s.id))
  const validStudents = parent.students.filter((s) => studentIds.includes(s.id) && myIds.has(s.id))
  if (validStudents.length === 0) return { success: false, error: 'Хүүхэд олдсонгүй' }

  return _recordAndReturn(validStudents, parent.id, pickupToken.teacherId)
}

async function _recordAndReturn(
  students: { id: number; firstname: string; lastname: string }[],
  parentId: number,
  teacherId: number
): Promise<Exclude<PickupScanResult, { success: 'select' }>> {
  const result = await recordPickup(students.map((s) => s.id), parentId, teacherId)
  const studentNames = students.map((s) => `${s.lastname} ${s.firstname}`)

  if (result.recorded === 0) {
    return { success: true, alreadyRecorded: true, message: 'Хүүхэд өнөөдөр аль хэдийн авагдсан байна', students: studentNames }
  }
  return { success: true, alreadyRecorded: false, message: `${result.recorded} хүүхэд амжилттай бүртгэгдлээ`, students: studentNames }
}

// ── Admin: pickup session жагсаалт ───────────────────────────────────────

export async function getPickupSessionList() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')
  return getPickupSessions()
}
