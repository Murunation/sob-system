'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyChildAttendance } from '@/app/actions/parent'

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
  const [student, setStudent] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    getMyChildAttendance().then((d) => {
      setStudent(d.student)
      setRecords(d.records)
    })
  }, [])

  const presentCount = records.filter((r) => r.status === 'PRESENT').length
  const absentCount = records.filter((r) => r.status !== 'PRESENT').length

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      {student && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Хүүхэд</p>
          <p className="font-bold text-gray-800 mt-0.5">
            {student.lastname} {student.firstname}
          </p>
          <p className="text-sm text-gray-500 mt-1">{student.group?.name}</p>
        </div>
      )}

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
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Ирцийн бүртгэл байхгүй байна</div>
        )}
      </div>
    </DashboardLayout>
  )
}
