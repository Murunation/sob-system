'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [students, setStudents] = useState<Student[]>([])
  const [meal, setMeal] = useState<Meal | null>(null)
  const [records, setRecords] = useState<Record<number, Record_>>({})
  const [loading, setLoading] = useState(false)

  async function loadData(selectedDate: string) {
    const data = await getMealLogs(selectedDate) as any
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

  useEffect(() => { loadData(date) }, [date])

  function setEaten(studentId: number, eaten: boolean) {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], eaten }
    }))
  }

  function setNote(studentId: number, note: string) {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
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

  const eatenCount = Object.values(records).filter(r => r.eaten).length
  const notEatenCount = Object.values(records).filter(r => !r.eaten).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/teacher')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Хооллолтын тэмдэглэл</h1>
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
        {/* Өнөөдрийн цэс */}
        {meal ? (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h2 className="font-semibold text-gray-700 mb-1">Өнөөдрийн цэс</h2>
            <p className="text-sm text-gray-600">{meal.menu}</p>
            {meal.allergyFlag && (
              <p className="text-xs text-red-500 mt-1">⚠️ Харшлын анхааруулга байна</p>
            )}
          </div>
        ) : (
          <div className="bg-orange-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-orange-600">⚠️ Өнөөдрийн хоолны цэс бүртгэгдээгүй байна</p>
          </div>
        )}

        {/* Статистик */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{eatenCount}</p>
            <p className="text-xs text-green-600">Хоол идсэн</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{notEatenCount}</p>
            <p className="text-xs text-red-600">Хоол идээгүй</p>
          </div>
        </div>

        {/* Хүүхдийн жагсаалт */}
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Хүүхэд олдсонгүй
            </div>
          )}
          {students.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">
                    {s.lastname} {s.firstname}
                  </span>
                  {s.healthInfo && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                      ⚠️ {s.healthInfo}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEaten(s.id, true)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      records[s.id]?.eaten
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    Идсэн
                  </button>
                  <button
                    onClick={() => setEaten(s.id, false)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      !records[s.id]?.eaten
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
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
                  onChange={e => setNote(s.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs mt-2"
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
            {loading ? 'Хадгалж байна...' : 'Тэмдэглэл хадгалах'}
          </button>
        )}
      </main>
    </div>
  )
}