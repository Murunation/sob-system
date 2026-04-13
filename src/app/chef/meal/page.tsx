'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getMealByDate,
  createMeal,
  updateMeal,
  getRecentMeals,
} from '@/app/actions/chef-meal'

type Meal = {
  id: number
  date: string
  menu: string
  ingredients: string | null
  allergyFlag: boolean
  servedStudents: number | null
  status: string
}

const emptyForm = {
  morning: '',
  noon: '',
  evening: '',
  ingredients: '',
  allergyFlag: false,
}

function menuToForm(menu: string) {
  const lines = menu.split('\n')
  return {
    morning: lines[0]?.replace('Өглөө: ', '') || '',
    noon: lines[1]?.replace('Өдөр: ', '') || '',
    evening: lines[2]?.replace('Орой: ', '') || '',
  }
}

function formToMenu(form: typeof emptyForm) {
  const parts = []
  if (form.morning.trim()) parts.push(`Өглөө: ${form.morning.trim()}`)
  if (form.noon.trim()) parts.push(`Өдөр: ${form.noon.trim()}`)
  if (form.evening.trim()) parts.push(`Орой: ${form.evening.trim()}`)
  return parts.join('\n')
}

export default function ChefMealPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [todayMeal, setTodayMeal] = useState<Meal | null>(null)
  const [recentMeals, setRecentMeals] = useState<Meal[]>([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  async function loadData(selectedDate: string) {
    const [meal, recent] = await Promise.all([
      getMealByDate(selectedDate),
      getRecentMeals(),
    ])
    setTodayMeal(meal as any)
    setRecentMeals(recent as any)
    if (meal) {
      const parsed = menuToForm((meal as any).menu)
      setForm({
        ...parsed,
        ingredients: (meal as any).ingredients || '',
        allergyFlag: (meal as any).allergyFlag,
      })
    } else {
      setForm(emptyForm)
    }
    setIsEditing(false)
    setErrors({})
  }

  useEffect(() => { loadData(date) }, [date])

  function validate() {
    const newErrors: Record<string, string> = {}
    const hasAny = form.morning.trim() || form.noon.trim() || form.evening.trim()

    if (!hasAny) {
      newErrors.morning = 'Дор хаяж нэг хоол оруулна уу'
    } else {
      if (form.morning.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(form.morning.trim())) {
        newErrors.morning = 'Зөвхөн үсэг агуулна'
      }
      if (form.noon.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(form.noon.trim())) {
        newErrors.noon = 'Зөвхөн үсэг агуулна'
      }
      if (form.evening.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(form.evening.trim())) {
        newErrors.evening = 'Зөвхөн үсэг агуулна'
      }
    }

    if (form.ingredients.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(form.ingredients.trim())) {
      newErrors.ingredients = 'Орц зөвхөн үсэг агуулна'
    }

    return newErrors
  }

  async function handleSubmit() {
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const menu = formToMenu(form)

    setLoading(true)
    try {
      if (todayMeal && isEditing) {
        await updateMeal(todayMeal.id, { menu, ingredients: form.ingredients, allergyFlag: form.allergyFlag })
        toast.success('Цэс амжилттай засагдлаа')
      } else {
        await createMeal({ date, menu, ingredients: form.ingredients, allergyFlag: form.allergyFlag })
        toast.success('Цэс амжилттай бүртгэгдлээ')
      }
      await loadData(date)
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    PLANNED: 'Төлөвлөсөн',
    CONFIRMED: 'Баталгаажсан',
    CLOSED: 'Хаагдсан',
  }

  const statusColor: Record<string, string> = {
    PLANNED: 'bg-orange-100 text-orange-600',
    CONFIRMED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/chef')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Өдрийн цэс</h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Цэс оруулах */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">
              {todayMeal && !isEditing ? 'Өнөөдрийн цэс' : todayMeal && isEditing ? 'Цэс засах' : 'Цэс оруулах'}
            </h2>

            {todayMeal && !isEditing ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[todayMeal.status]}`}>
                    {statusLabel[todayMeal.status]}
                  </span>
                  {todayMeal.status === 'PLANNED' && (
                    <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline">
                      Засах
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {todayMeal.menu.split('\n').map((line, i) => (
                    <p key={i} className="text-sm text-gray-600">{line}</p>
                  ))}
                </div>
                {todayMeal.ingredients && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Орц:</p>
                    <p className="text-sm text-gray-600">{todayMeal.ingredients}</p>
                  </div>
                )}
                {todayMeal.allergyFlag && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-3">
                    ⚠️ Харшлын орц агуулж байна
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Өглөө */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Өглөө</label>
                  <input
                    type="text"
                    value={form.morning}
                    onChange={e => setForm({ ...form, morning: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.morning ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Будаатай цай, талх..."
                  />
                  {errors.morning && <p className="text-red-500 text-xs mt-1">{errors.morning}</p>}
                </div>

                {/* Өдөр */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Өдөр</label>
                  <input
                    type="text"
                    value={form.noon}
                    onChange={e => setForm({ ...form, noon: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.noon ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Шөл, тараг..."
                  />
                  {errors.noon && <p className="text-red-500 text-xs mt-1">{errors.noon}</p>}
                </div>

                {/* Орой */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Орой</label>
                  <input
                    type="text"
                    value={form.evening}
                    onChange={e => setForm({ ...form, evening: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.evening ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Жигнэмэг..."
                  />
                  {errors.evening && <p className="text-red-500 text-xs mt-1">{errors.evening}</p>}
                </div>

                {/* Орц */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Орц
                    <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
                  </label>
                  <input
                    type="text"
                    value={form.ingredients}
                    onChange={e => setForm({ ...form, ingredients: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.ingredients ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Гурил, мах, лууван..."
                  />
                  {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
                </div>

                {/* Харшил */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allergyFlag"
                    checked={form.allergyFlag}
                    onChange={e => setForm({ ...form, allergyFlag: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="allergyFlag" className="text-sm text-gray-700">
                    ⚠️ Харшлын орц агуулж байна
                  </label>
                </div>

                <div className="flex gap-2">
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
                    >
                      Болих
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Хадгалж байна...' : isEditing ? 'Засах' : 'Бүртгэх'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Сүүлийн цэснүүд */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">Сүүлийн 7 хоног</h2>
            <div className="space-y-2">
              {recentMeals.map(m => (
                <div key={m.id} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {new Date(m.date).toLocaleDateString('mn-MN')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status]}`}>
                      {statusLabel[m.status]}
                    </span>
                  </div>
                  {m.menu.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-gray-500">{line}</p>
                  ))}
                  {m.allergyFlag && <span className="text-xs text-red-500">⚠️ харшил</span>}
                </div>
              ))}
              {recentMeals.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Цэс байхгүй байна</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}