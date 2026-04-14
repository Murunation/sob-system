'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { chefNavItems } from '@/app/chef/chef-nav'
import { getMealByDate, createMeal, updateMeal, getRecentMeals } from '@/app/actions/chef-meal'

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
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [todayMeal, setTodayMeal] = useState<Meal | null>(null)
  const [recentMeals, setRecentMeals] = useState<Meal[]>([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  async function loadData(selectedDate: string) {
    const [meal, recent] = await Promise.all([getMealByDate(selectedDate), getRecentMeals()])
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

  useEffect(() => {
    loadData(date)
  }, [date])

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
    <DashboardLayout navItems={chefNavItems} role="Тогооч">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-auto min-w-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            {todayMeal && !isEditing ? 'Өнөөдрийн цэс' : todayMeal && isEditing ? 'Цэс засах' : 'Цэс оруулах'}
          </h2>

          {todayMeal && !isEditing ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[todayMeal.status]}`}>
                  {statusLabel[todayMeal.status]}
                </span>
                {todayMeal.status === 'PLANNED' && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-purple-600 hover:underline font-medium"
                  >
                    Засах
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {todayMeal.menu.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    {line}
                  </p>
                ))}
              </div>
              {todayMeal.ingredients && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Орц:</p>
                  <p className="text-sm text-gray-600">{todayMeal.ingredients}</p>
                </div>
              )}
              {todayMeal.allergyFlag && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl mt-3">
                  Харшлын орц агуулж байна
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Өглөө</label>
                <input
                  type="text"
                  value={form.morning}
                  onChange={(e) => setForm({ ...form, morning: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.morning ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Будаатай цай, талх..."
                />
                {errors.morning && <p className="text-red-500 text-xs mt-1">{errors.morning}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Өдөр</label>
                <input
                  type="text"
                  value={form.noon}
                  onChange={(e) => setForm({ ...form, noon: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.noon ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Шөл, тараг..."
                />
                {errors.noon && <p className="text-red-500 text-xs mt-1">{errors.noon}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Орой</label>
                <input
                  type="text"
                  value={form.evening}
                  onChange={(e) => setForm({ ...form, evening: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.evening ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Жигнэмэг..."
                />
                {errors.evening && <p className="text-red-500 text-xs mt-1">{errors.evening}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Орц <span className="text-gray-400 font-normal">(заавал биш)</span>
                </label>
                <input
                  type="text"
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.ingredients ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Гурил, мах, лууван..."
                />
                {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allergyFlag"
                  checked={form.allergyFlag}
                  onChange={(e) => setForm({ ...form, allergyFlag: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="allergyFlag" className="text-sm text-gray-700">
                  Харшлын орц агуулж байна
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Болих
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50 transition"
                >
                  {loading ? 'Хадгалж байна...' : isEditing ? 'Засах' : 'Бүртгэх'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Сүүлийн 7 хоног</h2>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {recentMeals.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">{new Date(m.date).toLocaleDateString('mn-MN')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[m.status]}`}>{statusLabel[m.status]}</span>
                </div>
                {m.menu.split('\n').map((line, i) => (
                  <p key={i} className="text-xs text-gray-500">
                    {line}
                  </p>
                ))}
                {m.allergyFlag && <span className="text-xs text-red-500">Харшил</span>}
              </div>
            ))}
            {recentMeals.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Цэс байхгүй байна</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
