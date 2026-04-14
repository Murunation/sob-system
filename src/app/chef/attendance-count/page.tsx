'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { chefNavItems } from '@/app/chef/chef-nav'
import { getAttendanceCountByDate } from '@/app/actions/attendance'

type AttendanceSummary = {
  present: number
  absent: number
  sick: number
  excused: number
  total: number
}

export default function ChefAttendanceCountPage() {
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
    const records = (await getAttendanceCountByDate(selectedDate)) as any[]

    const present = records.filter((r) => r.status === 'PRESENT').length
    const absent = records.filter((r) => r.status === 'ABSENT').length
    const sick = records.filter((r) => r.status === 'SICK').length
    const excused = records.filter((r) => r.status === 'EXCUSED').length

    setSummary({ present, absent, sick, excused, total: records.length })
    setLoading(false)
  }

  useEffect(() => {
    loadData(date)
  }, [date])

  return (
    <DashboardLayout navItems={chefNavItems} role="Тогооч">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-auto min-w-0"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-2xl shadow-sm">Уншиж байна...</div>
      ) : (
        <>
          <div className="bg-[#1E1B4B] rounded-2xl p-6 sm:p-8 text-center text-white mb-4 shadow-sm">
            <p className="text-sm font-medium text-white/80 mb-2">Хоол идэх хүүхдийн тоо</p>
            <p className="text-5xl sm:text-6xl font-bold tracking-tight">{summary.present}</p>
            <p className="text-xs text-white/60 mt-3">{date}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-green-100">
              <p className="text-xl lg:text-2xl font-bold text-green-600">{summary.present}</p>
              <p className="text-xs text-green-600 mt-0.5">Ирсэн</p>
            </div>
            <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-red-100">
              <p className="text-xl lg:text-2xl font-bold text-red-600">{summary.absent}</p>
              <p className="text-xs text-red-600 mt-0.5">Тасалсан</p>
            </div>
            <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-orange-100">
              <p className="text-xl lg:text-2xl font-bold text-orange-600">{summary.sick}</p>
              <p className="text-xs text-orange-600 mt-0.5">Өвдсөн</p>
            </div>
            <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-blue-100">
              <p className="text-xl lg:text-2xl font-bold text-blue-600">{summary.excused}</p>
              <p className="text-xs text-blue-600 mt-0.5">Чөлөөтэй</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Нийт бүртгэлтэй хүүхэд</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
          </div>

          {summary.total === 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-orange-700">Энэ өдрийн ирцийн бүртгэл байхгүй байна</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
