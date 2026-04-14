'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getMealLogs, saveMealLogs } from '@/app/actions/meal-log'

type Student = {
  id: number
  firstname: string
  lastname: string
  healthInfo: string | null
}

type Meal = {
  id: number
  menu: string
  allergyFlag: boolean
}

type MealLog = {
  studentId: number
  eaten: boolean
  note: string | null
}

type Record_ = {
  studentId: number
  eaten: boolean
  note: string
}

export default function MealLogPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [students, setStudents] = useState<Student[]>([])
  const [meal, setMeal] = useState<Meal | null>(null)
  const [records, setRecords] = useState<Record<number, Record_>>({})
  const [loading, setLoading] = useState(false)

  async function loadData(selectedDate: string) {
    const data = (await getMealLogs(selectedDate)) as any
    if (!data || !data.students) return

    setStudents(data.students)
    setMeal(data.meal || null)

    const initial: Record<number, Record_> = {}
    for (const s of data.students) {
      const log = data.logs?.find((l: MealLog) => l.studentId === s.id)
      initial[s.id] = {
        studentId: s.id,
        eaten: log ? log.eaten : true,
        note: log?.note || '',
      }
    }
    setRecords(initial)
  }

  useEffect(() => {
    loadData(date)
  }, [date])

  function setEaten(studentId: number, eaten: boolean) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], eaten },
    }))
  }

  function setNote(studentId: number, note: string) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }))
  }

  async function handleSave() {
    if (!meal) {
      toast.error('Өнөөдрийн хоолны цэс бүртгэгдээгүй байна')
      return
    }
    setLoading(true)
    await saveMealLogs({
      date,
      mealId: meal.id,
      records: Object.values(records),
    })
    toast.success('Хооллолтын тэмдэглэл амжилттай хадгалагдлаа')
    setLoading(false)
  }

  const eatenCount = Object.values(records).filter((r) => r.eaten).length
  const notEatenCount = Object.values(records).filter((r) => !r.eaten).length

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

      {meal ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Өнөөдрийн цэс</h2>
          <p className="text-sm text-gray-600">{meal.menu}</p>
          {meal.allergyFlag && <p className="text-xs text-red-500 mt-2">Харшлын анхааруулга байна</p>}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4">
          <p className="text-sm text-orange-700">Өнөөдрийн хоолны цэс бүртгэгдээгүй байна</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-green-100">
          <p className="text-xl lg:text-2xl font-bold text-green-600">{eatenCount}</p>
          <p className="text-xs text-green-600 mt-0.5">Хоол идсэн</p>
        </div>
        <div className="bg-white rounded-2xl p-3 lg:p-4 text-center shadow-sm border border-red-100">
          <p className="text-xl lg:text-2xl font-bold text-red-600">{notEatenCount}</p>
          <p className="text-xs text-red-600 mt-0.5">Хоол идээгүй</p>
        </div>
      </div>

      <div className="space-y-3">
        {students.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">Хүүхэд олдсонгүй</div>
        )}
        {students.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="font-medium text-gray-800">
                  {s.lastname} {s.firstname}
                </span>
                {s.healthInfo && (
                  <span className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">{s.healthInfo}</span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEaten(s.id, true)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    records[s.id]?.eaten
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  Идсэн
                </button>
                <button
                  type="button"
                  onClick={() => setEaten(s.id, false)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    !records[s.id]?.eaten
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  Идээгүй
                </button>
              </div>
            </div>
            {!records[s.id]?.eaten && (
              <input
                type="text"
                placeholder="Шалтгаан..."
                value={records[s.id]?.note || ''}
                onChange={(e) => setNote(s.id, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
          {loading ? 'Хадгалж байна...' : 'Тэмдэглэл хадгалах'}
        </button>
      )}
    </DashboardLayout>
  )
}
