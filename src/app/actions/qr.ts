'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findTeacherByEmail } from '@/services/teacher.service'
import { findParentWithStudents } from '@/services/parent.service'
import {
  getOrCreateTodayToken,
  validateToken,
  recordQRAttendance,
} from '@/services/qr.service'

// ── Teacher: QR token авах / үүсгэх ───────────────────────────────────────

export async function getTeacherQRToken() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Нэвтрээгүй байна')

  const teacher = await findTeacherByEmail(session.user.email!)
  if (!teacher) throw new Error('Багш олдсонгүй')

  const result = await getOrCreateTodayToken(teacher.id)
  return { token: result.token, expiresAt: result.expiresAt.toISOString() }
}

// ── Parent: QR scan хийх ───────────────────────────────────────────────────

export type PendingStudent = { id: number; firstname: string; lastname: string }

export type ScanResult =
  | { success: true; alreadyRecorded: boolean; message: string; students: string[] }
  | { success: false; error: string; needsLogin?: boolean }
  /** 2+ хүүхэд бүлэгт байвал сонгуулна */
  | { success: 'select'; pendingStudents: PendingStudent[]; token: string; teacherId: number }

export async function scanQRToken(token: string): Promise<ScanResult> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { success: false, error: 'Нэвтрээгүй байна', needsLogin: true }
  }
  if ((session.user as any).role !== 'PARENT') {
    return { success: false, error: 'Зөвхөн асран хамгаалагч QR уншуулах боломжтой' }
  }

  const qrToken = await validateToken(token)
  if (!qrToken) {
    return { success: false, error: 'QR код хүчингүй эсвэл хугацаа дуусжээ' }
  }

  const parent = await findParentWithStudents(session.user.email!)
  if (!parent) {
    return { success: false, error: 'Асран хамгаалагч олдсонгүй' }
  }

  const groupId = qrToken.teacher.group?.id
  if (!groupId) {
    return { success: false, error: 'Багшийн бүлэг тохируулагдаагүй байна' }
  }

  const myStudentsInGroup = parent.students.filter((s) => s.groupId === groupId)
  if (myStudentsInGroup.length === 0) {
    return { success: false, error: 'Таны хүүхэд энэ бүлэгт байхгүй байна' }
  }

  // 2+ хүүхэд байвал эцэг эх аль хүүхдийг ирүүлсэн талаар сонгоно
  if (myStudentsInGroup.length > 1) {
    return {
      success: 'select',
      pendingStudents: myStudentsInGroup.map((s) => ({
        id: s.id,
        firstname: s.firstname,
        lastname: s.lastname,
      })),
      token,
      teacherId: qrToken.teacherId,
    }
  }

  // Ганц хүүхэд → шууд бүртгэнэ
  return _recordAndReturn(myStudentsInGroup, qrToken.teacherId)
}

/** Сонгосон хүүхдүүдийн ирцийг бүртгэнэ (эцэг эх сонголт хийсний дараа дуудна) */
export async function recordQRForStudents(
  token: string,
  studentIds: number[]
): Promise<Exclude<ScanResult, { success: 'select' }>> {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false, error: 'Нэвтрээгүй байна' }
  if ((session.user as any).role !== 'PARENT') {
    return { success: false, error: 'Зөвхөн асран хамгаалагч QR уншуулах боломжтой' }
  }

  const qrToken = await validateToken(token)
  if (!qrToken) {
    return { success: false, error: 'QR код хугацаа дуусжээ' }
  }

  // studentIds нь тухайн эцэг эхийнх эсэхийг шалгах
  const parent = await findParentWithStudents(session.user.email!)
  if (!parent) return { success: false, error: 'Асран хамгаалагч олдсонгүй' }

  const myIds = new Set(parent.students.map((s) => s.id))
  const validStudents = parent.students.filter(
    (s) => studentIds.includes(s.id) && myIds.has(s.id)
  )
  if (validStudents.length === 0) {
    return { success: false, error: 'Хүүхэд олдсонгүй' }
  }

  return _recordAndReturn(validStudents, qrToken.teacherId)
}

// ── Internal helper ────────────────────────────────────────────────────────

async function _recordAndReturn(
  students: { id: number; firstname: string; lastname: string }[],
  teacherId: number
): Promise<Exclude<ScanResult, { success: 'select' }>> {
  const result = await recordQRAttendance(
    students.map((s) => s.id),
    teacherId
  )
  const studentNames = students.map((s) => `${s.lastname} ${s.firstname}`)

  if (result.recorded === 0) {
    return {
      success: true,
      alreadyRecorded: true,
      message: 'Ирц өнөөдөр аль хэдийн бүртгэгдсэн байна',
      students: studentNames,
    }
  }
  return {
    success: true,
    alreadyRecorded: false,
    message: `${result.recorded} хүүхдийн ирц амжилттай бүртгэгдлээ`,
    students: studentNames,
  }
}
