'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyChildren, getMyChildAttendance } from '@/app/actions/parent'
import QRScanner from '@/components/ui/QRScanner'

type Child = {
  id: number
  firstname: string
  lastname: string
  groupId: number | null
  group?: { id: number; name: string } | null
}

type AttendanceRecord = {
  id: number
  date: string
  status: string
  note?: string | null
}

const statusLabel: Record<string, string> = {
  PRESENT: 'Ирсэн',
  ABSENT: 'Тасалсан',
  SICK: 'Өвдсөн',
  EXCUSED: 'Чөлөөтэй',
}

const statusColor: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  SICK: 'bg-orange-100 text-orange-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
}

export default function ParentAttendancePage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Бүх хүүхдийг ачаалах
  useEffect(() => {
    getMyChildren().then((kids) => {
      setChildren(kids as Child[])
      if (kids.length > 0) setSelectedId(kids[0].id)
    })
  }, [])

  // Сонгосон хүүхдийн ирцийг ачаалах
  const loadAttendance = useCallback(async (studentId: number) => {
    setLoading(true)
    const data = await getMyChildAttendance(studentId)
    setRecords((data.records as AttendanceRecord[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedId !== null) loadAttendance(selectedId)
  }, [selectedId, loadAttendance])

  const onQRSuccess = useCallback(() => {
    if (selectedId !== null) loadAttendance(selectedId)
  }, [selectedId, loadAttendance])

  const selected = children.find((c) => c.id === selectedId)
  const presentCount = records.filter((r) => r.status === 'PRESENT').length
  const absentCount = records.filter((r) => r.status !== 'PRESENT').length

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">

      {/* Child selector + QR button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          {/* Multi-child tabs */}
          {children.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
                    selectedId === c.id
                      ? 'bg-[#1E1B4B] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {c.lastname} {c.firstname}
                </button>
              ))}
            </div>
          )}

          {/* Selected child info card */}
          {selected && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Хүүхэд</p>
              <p className="font-bold text-gray-800 mt-0.5">
                {selected.lastname} {selected.firstname}
              </p>
              {selected.group && (
                <p className="text-sm text-gray-500 mt-0.5">{selected.group.name}</p>
              )}
            </div>
          )}
          {children.length === 0 && !loading && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-400">Хүүхдийн мэдээлэл олдсонгүй</p>
            </div>
          )}
        </div>

        <QRScanner onSuccess={onQRSuccess} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-100">
          <p className="text-2xl lg:text-3xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-green-600 mt-1">Ирсэн өдөр</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-red-100">
          <p className="text-2xl lg:text-3xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-red-600 mt-1">Ирээгүй өдөр</p>
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-12 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <span className="text-sm text-gray-600">{new Date(r.date).toLocaleDateString('mn-MN')}</span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {r.note && <span className="text-xs text-gray-400 truncate max-w-[200px]">{r.note}</span>}
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColor[r.status]}`}>
                  {statusLabel[r.status]}
                </span>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
              Ирцийн бүртгэл байхгүй байна
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
