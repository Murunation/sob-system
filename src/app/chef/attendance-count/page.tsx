'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAttendanceCountByDate } from '@/app/actions/attendance'

type AttendanceSummary = {
  present: number
  absent: number
  sick: number
  excused: number
  total: number
}

export default function ChefAttendanceCountPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    sick: 0,
    excused: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(false)

  async function loadData(selectedDate: string) {
    setLoading(true)
    const records = await getAttendanceCountByDate(selectedDate) as any[]

    const present = records.filter(r => r.status === 'PRESENT').length
    const absent = records.filter(r => r.status === 'ABSENT').length
    const sick = records.filter(r => r.status === 'SICK').length
    const excused = records.filter(r => r.status === 'EXCUSED').length

    setSummary({ present, absent, sick, excused, total: records.length })
    setLoading(false)
  }

  useEffect(() => { loadData(date) }, [date])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/chef')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Ирцийн тоо</h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Уншиж байна...</div>
        ) : (
          <>
            {/* Хоол идэх хүүхдийн тоо */}
            <div className="bg-blue-600 rounded-2xl p-8 text-center text-white mb-6 shadow-md">
              <p className="text-lg font-medium opacity-80 mb-2">Хоол идэх хүүхдийн тоо</p>
              <p className="text-7xl font-bold">{summary.present}</p>
              <p className="text-sm opacity-70 mt-3">{date}</p>
            </div>

            {/* Дэлгэрэнгүй */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                <p className="text-sm text-green-600 mt-1">Ирсэн</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-500">{summary.absent}</p>
                <p className="text-sm text-red-500 mt-1">Тасалсан</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">{summary.sick}</p>
                <p className="text-sm text-orange-500 mt-1">Өвдсөн</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">{summary.excused}</p>
                <p className="text-sm text-blue-500 mt-1">Чөлөөтэй</p>
              </div>
            </div>

            {/* Нийт */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Нийт бүртгэлтэй хүүхэд</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
            </div>

            {summary.total === 0 && (
              <div className="mt-4 bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-orange-600">
                  ⚠️ Энэ өдрийн ирцийн бүртгэл байхгүй байна
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}