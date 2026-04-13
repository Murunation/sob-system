'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getAllAttendanceByDate, adminUpdateAttendance } from '@/app/actions/admin'

type Attendance = {
  id: number
  status: string
  note: string | null
  editedBy: string | null
  editedAt: string | null
  student: { firstname: string; lastname: string }
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'SICK' | 'EXCUSED'

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

export default function AdminAttendancePage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [records, setRecords] = useState<Attendance[]>([])
  const [changes, setChanges] = useState<Record<number, { status: AttendanceStatus; note: string }>>({})
  const [loading, setLoading] = useState(false)

  async function loadData(selectedDate: string) {
    const r = await getAllAttendanceByDate(selectedDate)
    setRecords(r as any)
    setChanges({})
  }

  useEffect(() => { loadData(date) }, [date])

  function setStatus(id: number, status: AttendanceStatus, currentNote: string) {
    setChanges(prev => ({
      ...prev,
      [id]: { status, note: prev[id]?.note ?? currentNote ?? '' }
    }))
  }

  function setNote(id: number, note: string, currentStatus: string) {
    setChanges(prev => ({
      ...prev,
      [id]: { status: (prev[id]?.status ?? currentStatus) as AttendanceStatus, note }
    }))
  }

  async function handleSave() {
    if (Object.keys(changes).length === 0) {
      toast.error('Засвар байхгүй байна')
      return
    }
    setLoading(true)
    for (const [id, data] of Object.entries(changes)) {
      await adminUpdateAttendance(Number(id), data)
    }
    toast.success('Ирц амжилттай засагдлаа')
    await loadData(date)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Ирцийн засвар</h1>
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
            {loading ? 'Хадгалж байна...' : 'Засвар хадгалах'}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-3">
          {records.map(r => {
            const current = changes[r.id]
            const status = (current?.status ?? r.status) as AttendanceStatus
            const note = current?.note ?? r.note ?? ''
            const isChanged = !!changes[r.id]

            return (
              <div key={r.id} className={`bg-white rounded-xl p-4 shadow-sm ${isChanged ? 'border-2 border-yellow-300' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-800">
                      {r.student.lastname} {r.student.firstname}
                    </span>
                    {isChanged && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">
                        Засварласан
                      </span>
                    )}
                    {r.editedBy && (
                      <span className="ml-2 text-xs text-gray-400">
                        (Өмнө засварласан: {r.editedBy})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-2">
                  {(Object.keys(statusLabels) as AttendanceStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(r.id, s, r.note || '')}
                      className={`px-3 py-1 rounded-full text-xs border font-medium transition ${
                        status === s ? statusColors[s] : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>

                {status !== 'PRESENT' && (
                  <input
                    type="text"
                    placeholder="Нэмэлт тэмдэглэл..."
                    value={note}
                    onChange={e => setNote(r.id, e.target.value, r.status)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                )}
              </div>
            )
          })}
          {records.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Энэ өдрийн ирцийн бүртгэл байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}