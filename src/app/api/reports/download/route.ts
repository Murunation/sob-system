import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findReportById } from '@/services/report.service'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// Status display maps
const attendanceLabel: Record<string, string> = {
  PRESENT: 'Ирсэн',
  ABSENT: 'Тасалсан',
  SICK: 'Өвдсөн',
  EXCUSED: 'Чөлөөтэй',
}

const mealStatusLabel: Record<string, string> = {
  PLANNED: 'Төлөвлөсөн',
  CONFIRMED: 'Баталгаажсан',
  CLOSED: 'Хаагдсан',
}

function parseRange(dateRange: string): { start: Date; end: Date } {
  // dateRange format: "2024-01-01-2024-01-31" (two ISO dates joined by '-')
  // First date: chars 0..9, separator at char 10, second date: chars 11..20
  const start = new Date(dateRange.substring(0, 10) + 'T00:00:00.000Z')
  const end = new Date(dateRange.substring(11) + 'T23:59:59.999Z')
  return { start, end }
}

async function generateAttendanceExcel(
  teacherId: number,
  dateRange: string,
  type: string,
): Promise<ArrayBuffer> {
  const { start, end } = parseRange(dateRange)

  const records = await prisma.attendance.findMany({
    where: {
      teacherId,
      date: { gte: start, lte: end },
    },
    select: {
      date: true,
      status: true,
      note: true,
      student: { select: { firstname: true, lastname: true } },
    },
    orderBy: [{ date: 'asc' }, { student: { lastname: 'asc' } }],
  })

  const rows = records.map((r) => ({
    Огноо: new Date(r.date).toLocaleDateString('mn-MN'),
    Овог: r.student.lastname,
    Нэр: r.student.firstname,
    Статус: attendanceLabel[r.status] ?? r.status,
    Тэмдэглэл: r.note ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // Огноо
    { wch: 15 }, // Овог
    { wch: 15 }, // Нэр
    { wch: 12 }, // Статус
    { wch: 30 }, // Тэмдэглэл
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ирцийн тайлан')

  // Summary sheet
  const statusCounts: Record<string, number> = {
    PRESENT: 0, ABSENT: 0, SICK: 0, EXCUSED: 0,
  }
  records.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1 })
  const summaryRows = Object.entries(statusCounts).map(([k, v]) => ({
    Статус: attendanceLabel[k] ?? k,
    Тоо: v,
  }))
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Нэгтгэл')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

async function generateMealExcel(
  chefId: number,
  dateRange: string,
  type: string,
): Promise<ArrayBuffer> {
  const { start, end } = parseRange(dateRange)

  const meals = await prisma.meal.findMany({
    where: {
      chefId,
      date: { gte: start, lte: end },
    },
    select: {
      date: true,
      menu: true,
      ingredients: true,
      allergyFlag: true,
      servedStudents: true,
      status: true,
      mealLogs: {
        select: { eaten: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  const rows = meals.map((m) => {
    const eaten = m.mealLogs.filter((l) => l.eaten).length
    return {
      Огноо: new Date(m.date).toLocaleDateString('mn-MN'),
      Цэс: m.menu,
      Орц: m.ingredients,
      'Харшил байгаа эсэх': m.allergyFlag ? 'Тийм' : 'Үгүй',
      'Үйлчилгээ авсан хүүхэд': m.servedStudents ?? eaten,
      Статус: mealStatusLabel[m.status] ?? m.status,
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 30 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Хоолны тайлан')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

async function generateDevelopmentExcel(
  teacherId: number,
  dateRange: string,
): Promise<ArrayBuffer> {
  const { start, end } = parseRange(dateRange)

  const reviews = await prisma.review.findMany({
    where: {
      teacherId,
      createdAt: { gte: start, lte: end },
    },
    select: {
      createdAt: true,
      behavior: true,
      development: true,
      note: true,
      status: true,
      student: { select: { firstname: true, lastname: true } },
    },
    orderBy: [{ createdAt: 'asc' }, { student: { lastname: 'asc' } }],
  })

  const rows = reviews.map((r) => ({
    Огноо: new Date(r.createdAt).toLocaleDateString('mn-MN'),
    Овог: r.student.lastname,
    Нэр: r.student.firstname,
    'Зан төлөв': r.behavior ?? '',
    Хөгжил: r.development ?? '',
    Тэмдэглэл: r.note ?? '',
    Статус: r.status === 'SENT' ? 'Илгээсэн' : r.status === 'READ' ? 'Уншигдсан' : 'Ноорог',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 30 },
    { wch: 25 },
    { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Хөгжлийн тайлан')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

async function generateMonthlyExcel(
  teacherId: number,
  dateRange: string,
): Promise<ArrayBuffer> {
  const { start, end } = parseRange(dateRange)

  const [attendance, reviews] = await Promise.all([
    prisma.attendance.findMany({
      where: { teacherId, date: { gte: start, lte: end } },
      select: {
        date: true,
        status: true,
        note: true,
        student: { select: { firstname: true, lastname: true } },
      },
      orderBy: [{ date: 'asc' }, { student: { lastname: 'asc' } }],
    }),
    prisma.review.findMany({
      where: { teacherId, createdAt: { gte: start, lte: end } },
      select: {
        createdAt: true,
        behavior: true,
        development: true,
        note: true,
        student: { select: { firstname: true, lastname: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const wb = XLSX.utils.book_new()

  // Attendance sheet
  const attRows = attendance.map((r) => ({
    Огноо: new Date(r.date).toLocaleDateString('mn-MN'),
    Овог: r.student.lastname,
    Нэр: r.student.firstname,
    Статус: attendanceLabel[r.status] ?? r.status,
    Тэмдэглэл: r.note ?? '',
  }))
  const wsAtt = XLSX.utils.json_to_sheet(attRows)
  wsAtt['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsAtt, 'Ирц')

  // Reviews sheet
  const revRows = reviews.map((r) => ({
    Огноо: new Date(r.createdAt).toLocaleDateString('mn-MN'),
    Овог: r.student.lastname,
    Нэр: r.student.firstname,
    'Зан төлөв': r.behavior ?? '',
    Хөгжил: r.development ?? '',
    Тэмдэглэл: r.note ?? '',
  }))
  const wsRev = XLSX.utils.json_to_sheet(revRows)
  wsRev['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, wsRev, 'Хөгжил')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

async function generateMealLogExcel(
  teacherId: number,
  dateRange: string,
): Promise<ArrayBuffer> {
  const { start, end } = parseRange(dateRange)

  // Get teacher's group students
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      group: {
        select: {
          students: {
            where: { status: 'ACTIVE' },
            select: { id: true, firstname: true, lastname: true },
          },
        },
      },
    },
  })

  const studentIds = teacher?.group?.students.map((s) => s.id) ?? []
  const studentMap = new Map(
    (teacher?.group?.students ?? []).map((s) => [s.id, s])
  )

  const logs = await prisma.mealLog.findMany({
    where: {
      studentId: { in: studentIds },
      createdAt: { gte: start, lte: end },
    },
    select: {
      createdAt: true,
      eaten: true,
      note: true,
      studentId: true,
      meal: { select: { date: true, menu: true } },
    },
    orderBy: [{ meal: { date: 'asc' } }, { studentId: 'asc' }],
  })

  const rows = logs.map((l) => {
    const s = studentMap.get(l.studentId)
    return {
      Огноо: new Date(l.meal.date).toLocaleDateString('mn-MN'),
      Овог: s?.lastname ?? '',
      Нэр: s?.firstname ?? '',
      Цэс: l.meal.menu,
      Идсэн: l.eaten ? 'Тийм' : 'Үгүй',
      Тэмдэглэл: l.note ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 8 },
    { wch: 20 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Хоолны тайлан')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const reportId = Number(searchParams.get('id'))
  if (!reportId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const report = await findReportById(reportId)
  if (!report || !report.filePath) {
    return NextResponse.json({ error: 'Report not found or no file data' }, { status: 404 })
  }

  let params: any
  try {
    params = JSON.parse(report.filePath)
  } catch {
    return NextResponse.json({ error: 'Invalid report params' }, { status: 400 })
  }

  const role = (session.user as any).role
  // Allow admin to download any, teacher/chef only their own
  if (role === 'TEACHER' && params.userId !== Number((session.user as any).id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (role === 'CHEF' && params.userId !== Number((session.user as any).id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const type = params.type as string
  const dateRange = params.dateRange as string

  let buffer: ArrayBuffer
  const safeType = type
    .replace(/[/\\?%*:|"<>]/g, '-')
    .substring(0, 40)
  const fileName = `${safeType}_${dateRange}.xlsx`

  try {
    if (params.role === 'TEACHER') {
      if (type === 'Ирцийн тайлан') {
        buffer = await generateAttendanceExcel(params.teacherId, dateRange, type)
      } else if (type === 'Хөгжлийн тайлан') {
        buffer = await generateDevelopmentExcel(params.teacherId, dateRange)
      } else if (type === 'Хоолны тайлан') {
        buffer = await generateMealLogExcel(params.teacherId, dateRange)
      } else {
        // Сарын нэгдсэн тайлан or any other teacher report
        buffer = await generateMonthlyExcel(params.teacherId, dateRange)
      }
    } else if (params.role === 'CHEF') {
      buffer = await generateMealExcel(params.chefId, dateRange, type)
    } else {
      return NextResponse.json({ error: 'Unknown role' }, { status: 400 })
    }
  } catch (err) {
    console.error('Report generation error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Content-Length': String(buffer.byteLength),
    },
  })
}
