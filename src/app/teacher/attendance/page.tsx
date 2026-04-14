'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import {
  getMyGroupStudents,
  getAttendanceByDate,
  saveAttendance,
} from '@/app/actions/attendance'

type Student = {
  id: number
  firstname: string
  lastname: string
  healthInfo: string | null
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'

type AttendanceRecord = {
  studentId: number
  status: AttendanceStatus
  note: string
}

const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Ирсэн',
  ABSENT: 'Тасалсан',
  SICK: 'Өвдсөн',
  EXCUSED: 'Чөлөөтэй',
}

const statusColors: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300',
  ABSENT: 'bg-red-100 text-red-700 border-red-300',
  SICK: 'bg-orange-100 text-orange-700 border-orange-300',
  EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300',
}

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [students, setStudents] = useState<Student[]>([])
  const [records, setRecords] = useState<Record<number, AttendanceRecord>>({})
  const [loading, setLoading] = useState(false)

  async function loadData(selectedDate: string) {
    const [studs, existing] = await Promise.all([
      getMyGroupStudents(),
      getAttendanceByDate(selectedDate),
    ])

    setStudents(studs as any)

    const initial: Record<number, AttendanceRecord> = {}
    for (const s of studs as any[]) {
      initial[s.id] = { studentId: s.id, status: 'PRESENT', note: '' }
    }

    for (const a of existing as any[]) {
      initial[a.studentId] = {
        studentId: a.studentId,
        status: a.status,
        note: a.note || '',
      }
    }

    setRecords(initial)
  }

  useEffect(() => {
    loadData(date)
  }, [date])

  function setStatus(studentId: number, status: AttendanceStatus) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  function setNote(studentId: number, note: string) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }))
  }

  async function handleSave() {
    setLoading(true)
    await saveAttendance({
      date,
      records: Object.values(records),
    })
    toast.success('Ирц амжилттай хадгалагдлаа')
    setLoading(false)
  }

  const presentCount = Object.values(records).filter((r) => r.status === 'PRESENT').length
  const absentCount = Object.values(records).filter((r) => r.status === 'ABSENT').length
  const sickCount = Object.values(records).filter((r) => r.status === 'SICK').length
  const excusedCount = Object.values(records).filter((r) => r.status === 'EXCUSED').length

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-auto min-w-0"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1E1B4B] text-white px-4 py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] transition disabled:opacity-50 shrink-0"
        >
          {loading ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-green-100">
          <p className="text-xl lg:text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-green-600 mt-0.5">Ирсэн</p>
        </div>
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-red-100">
          <p className="text-xl lg:text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-red-600 mt-0.5">Тасалсан</p>
        </div>
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-orange-100">
          <p className="text-xl lg:text-2xl font-bold text-orange-600">{sickCount}</p>
          <p className="text-xs text-orange-600 mt-0.5">Өвдсөн</p>
        </div>
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-blue-100">
          <p className="text-xl lg:text-2xl font-bold text-blue-600">{excusedCount}</p>
          <p className="text-xs text-blue-600 mt-0.5">Чөлөөтэй</p>
        </div>
      </div>

      <div className="space-y-3">
        {students.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
            Хүүхэд олдсонгүй — бүлэг хуваарилагдаагүй байж болно
          </div>
        )}
        {students.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="min-w-0">
                <span className="font-medium text-gray-800">
                  {s.lastname} {s.firstname}
                </span>
                {s.healthInfo && (
                  <span className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg inline-block mt-1 sm:mt-0">
                    {s.healthInfo}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {(Object.keys(statusLabels) as AttendanceStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatus(s.id, status)}
                  className={`px-3 py-1.5 rounded-full text-xs border font-medium transition ${
                    records[s.id]?.status === status
                      ? statusColors[status]
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>

            {records[s.id]?.status !== 'PRESENT' && (
              <input
                type="text"
                placeholder="Нэмэлт тэмдэглэл..."
                value={records[s.id]?.note || ''}
                onChange={(e) => setNote(s.id, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            )}
          </div>
        ))}
      </div>

      {students.length > 0 && (
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-4 bg-[#1E1B4B] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition disabled:opacity-50"
        >
          {loading ? 'Хадгалж байна...' : 'Ирц хадгалах'}
        </button>
      )}
    </DashboardLayout>
  )
}
