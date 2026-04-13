'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  const router = useRouter()
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

    // Default: бүгдийг PRESENT болгох
    const initial: Record<number, AttendanceRecord> = {}
    for (const s of studs as any[]) {
      initial[s.id] = { studentId: s.id, status: 'PRESENT', note: '' }
    }

    // Аль хэдийн бүртгэлтэй бол тэр утгыг харуулах
    for (const a of existing as any[]) {
      initial[a.studentId] = {
        studentId: a.studentId,
        status: a.status,
        note: a.note || '',
      }
    }

    setRecords(initial)
  }

  useEffect(() => { loadData(date) }, [date])

  function setStatus(studentId: number, status: AttendanceStatus) {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }))
  }

  function setNote(studentId: number, note: string) {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
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

  const presentCount = Object.values(records).filter(r => r.status === 'PRESENT').length
  const absentCount = Object.values(records).filter(r => r.status === 'ABSENT').length
  const sickCount = Object.values(records).filter(r => r.status === 'SICK').length
  const excusedCount = Object.values(records).filter(r => r.status === 'EXCUSED').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/teacher')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Ирц бүртгэх</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Статистик */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-xs text-green-600">Ирсэн</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-xs text-red-600">Тасалсан</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{sickCount}</p>
            <p className="text-xs text-orange-600">Өвдсөн</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
            <p className="text-xs text-blue-600">Чөлөөтэй</p>
          </div>
        </div>

        {/* Хүүхдийн жагсаалт */}
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Хүүхэд олдсонгүй — бүлэг хуваарилагдаагүй байж болно
            </div>
          )}
          {students.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">
                    {s.lastname} {s.firstname}
                  </span>
                  {s.healthInfo && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">⚠️ {s.healthInfo}</span>
                  )}
                </div>
              </div>

              {/* Статус товчнууд */}
              <div className="flex gap-2 flex-wrap mb-2">
                {(Object.keys(statusLabels) as AttendanceStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatus(s.id, status)}
                    className={`px-3 py-1 rounded-full text-xs border font-medium transition ${
                      records[s.id]?.status === status
                        ? statusColors[status]
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>

              {/* Тэмдэглэл */}
              {records[s.id]?.status !== 'PRESENT' && (
                <input
                  type="text"
                  placeholder="Нэмэлт тэмдэглэл..."
                  value={records[s.id]?.note || ''}
                  onChange={e => setNote(s.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs mt-1"
                />
              )}
            </div>
          ))}
        </div>

        {students.length > 0 && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Хадгалж байна...' : 'Ирц хадгалах'}
          </button>
        )}
      </main>
    </div>
  )
}