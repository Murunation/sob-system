'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    getMyChildAttendance().then(d => {
      setStudent(d.student)
      setRecords(d.records)
    })
  }, [])

  const presentCount = records.filter(r => r.status === 'PRESENT').length
  const absentCount = records.filter(r => r.status !== 'PRESENT').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Ирцийн мэдээлэл</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {student && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <p className="text-sm text-gray-500">Хүүхэд</p>
            <p className="font-bold text-gray-800">{student.lastname} {student.firstname}</p>
            <p className="text-sm text-gray-500">{student.group?.name}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-green-600">Ирсэн өдөр</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{absentCount}</p>
            <p className="text-sm text-red-500">Ирээгүй өдөр</p>
          </div>
        </div>

        <div className="space-y-2">
          {records.map(r => (
            <div key={r.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {new Date(r.date).toLocaleDateString('mn-MN')}
              </span>
              <div className="flex items-center gap-2">
                {r.note && <span className="text-xs text-gray-400">{r.note}</span>}
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>
                  {statusLabel[r.status]}
                </span>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Ирцийн бүртгэл байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}