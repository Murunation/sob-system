'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getAllAttendanceByDate, adminUpdateAttendance } from '@/app/actions/admin'

type Attendance = {
  id: number
  status: string
  note: string | null
  editedBy: string | null
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

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
]

export default function AdminAttendancePage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [records, setRecords] = useState<Attendance[]>([])
  const [changes, setChanges] = useState<Record<number, { status: AttendanceStatus; note: string }>>({})
  const [loading, setLoading] = useState(false)

  async function loadData(d: string) {
    const r = await getAllAttendanceByDate(d)
    setRecords(r as any)
    setChanges({})
  }

  useEffect(() => { loadData(date) }, [date])

  function setStatus(id: number, status: AttendanceStatus, note: string) {
    setChanges(prev => ({ ...prev, [id]: { status, note: prev[id]?.note ?? note ?? '' } }))
  }

  function setNote(id: number, note: string, currentStatus: string) {
    setChanges(prev => ({ ...prev, [id]: { status: (prev[id]?.status ?? currentStatus) as AttendanceStatus, note } }))
  }

  async function handleSave() {
    if (Object.keys(changes).length === 0) { toast.error('Засвар байхгүй байна'); return }
    setLoading(true)
    for (const [id, data] of Object.entries(changes)) {
      await adminUpdateAttendance(Number(id), data)
    }
    toast.success('Ирц засагдлаа')
    await loadData(date)
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="flex justify-between items-center mb-5">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50"
        >
          {loading ? 'Хадгалж байна...' : 'Засвар хадгалах'}
        </button>
      </div>

      <div className="space-y-3">
        {records.map(r => {
          const current = changes[r.id]
          const status = (current?.status ?? r.status) as AttendanceStatus
          const note = current?.note ?? r.note ?? ''
          const isChanged = !!changes[r.id]

          return (
            <div key={r.id} className={`bg-white rounded-2xl p-4 shadow-sm ${isChanged ? 'border-2 border-yellow-300' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">
                  {r.student.lastname} {r.student.firstname}
                </span>
                <div className="flex items-center gap-2">
                  {isChanged && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Засварласан</span>
                  )}
                  {r.editedBy && (
                    <span className="text-xs text-gray-400">({r.editedBy})</span>
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
                  placeholder="Тэмдэглэл..."
                  value={note}
                  onChange={e => setNote(r.id, e.target.value, r.status)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              )}
            </div>
          )
        })}
        {records.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300">
            Энэ өдрийн ирцийн бүртгэл байхгүй байна
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}