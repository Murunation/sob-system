'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createMeal, getMealByDate } from '@/app/actions/chef-meal'

const DAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан']

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

type DayForm = {
  morning: string
  noon: string
  evening: string
  ingredients: string
  allergyFlag: boolean
  exists: boolean
}

const emptyDay: DayForm = {
  morning: '',
  noon: '',
  evening: '',
  ingredients: '',
  allergyFlag: false,
  exists: false,
}

function formToMenu(f: DayForm) {
  const parts = []
  if (f.morning.trim()) parts.push(`Өглөө: ${f.morning.trim()}`)
  if (f.noon.trim()) parts.push(`Өдөр: ${f.noon.trim()}`)
  if (f.evening.trim()) parts.push(`Орой: ${f.evening.trim()}`)
  return parts.join('\n')
}

export default function ChefWeeklyMealPage() {
  const router = useRouter()
  const monday = getMonday(new Date())
  const [weekStart, setWeekStart] = useState(monday.toISOString().split('T')[0])
  const [forms, setForms] = useState<DayForm[]>(DAYS.map(() => ({ ...emptyDay })))
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  async function loadWeekData(start: string) {
    const startDate = new Date(start)
    const newForms: DayForm[] = []
    for (let i = 0; i < 5; i++) {
      const date = addDays(startDate, i)
      const meal = await getMealByDate(date) as any
      if (meal) {
        const lines = meal.menu.split('\n')
        newForms.push({
          morning: lines.find((l: string) => l.startsWith('Өглөө:'))?.replace('Өглөө: ', '') || '',
          noon: lines.find((l: string) => l.startsWith('Өдөр:'))?.replace('Өдөр: ', '') || '',
          evening: lines.find((l: string) => l.startsWith('Орой:'))?.replace('Орой: ', '') || '',
          ingredients: meal.ingredients || '',
          allergyFlag: meal.allergyFlag || false,
          exists: true,
        })
      } else {
        newForms.push({ ...emptyDay })
      }
    }
    setForms(newForms)
    setErrors({})
  }

  useEffect(() => { loadWeekData(weekStart) }, [weekStart])

  function updateForm(index: number, field: string, value: any) {
    setForms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
  }

  async function handleSave() {
    const newErrors: Record<number, Record<string, string>> = {}

    forms.forEach((f, i) => {
      if (f.exists) return
      const dayErrors: Record<string, string> = {}
      const hasAny = f.morning.trim() || f.noon.trim() || f.evening.trim()
      if (!hasAny) return

      if (f.morning.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(f.morning.trim())) {
        dayErrors.morning = 'Зөвхөн үсэг агуулна'
      }
      if (f.noon.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(f.noon.trim())) {
        dayErrors.noon = 'Зөвхөн үсэг агуулна'
      }
      if (f.evening.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(f.evening.trim())) {
        dayErrors.evening = 'Зөвхөн үсэг агуулна'
      }
      if (f.ingredients.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,()-]+$/.test(f.ingredients.trim())) {
        dayErrors.ingredients = 'Зөвхөн үсэг агуулна'
      }
      if (Object.keys(dayErrors).length > 0) newErrors[i] = dayErrors
    })

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    const startDate = new Date(weekStart)
    let successCount = 0

    for (let i = 0; i < 5; i++) {
      const f = forms[i]
      if (f.exists) continue
      const hasAny = f.morning.trim() || f.noon.trim() || f.evening.trim()
      if (!hasAny) continue

      const date = addDays(startDate, i)
      const menu = formToMenu(f)
      try {
        await createMeal({ date, menu, ingredients: f.ingredients, allergyFlag: f.allergyFlag })
        successCount++
      } catch (e) {}
    }

    if (successCount > 0) {
      toast.success(`${successCount} өдрийн цэс амжилттай бүртгэгдлээ`)
    } else {
      toast.error('Бүртгэх шинэ цэс байхгүй байна')
    }

    await loadWeekData(weekStart)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/chef')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">7 хоногийн цэс</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
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

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((day, i) => {
            const date = addDays(new Date(weekStart), i)
            const f = forms[i]
            const e = errors[i] || {}

            return (
              <div key={i} className={`bg-white rounded-xl p-4 shadow-sm ${f.exists ? 'border-2 border-green-200' : ''}`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-700 text-sm">{day}</h3>
                  {f.exists && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">{date}</p>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Өглөө</label>
                    <input
                      type="text"
                      value={f.morning}
                      onChange={e => updateForm(i, 'morning', e.target.value)}
                      disabled={f.exists}
                      className={`w-full border rounded-lg px-2 py-1.5 text-xs mt-0.5 ${e.morning ? 'border-red-500' : 'border-gray-300'} ${f.exists ? 'bg-gray-50 text-gray-400' : ''}`}
                      placeholder="Будаатай цай..."
                    />
                    {e.morning && <p className="text-red-500 text-xs mt-0.5">{e.morning}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Өдөр</label>
                    <input
                      type="text"
                      value={f.noon}
                      onChange={e => updateForm(i, 'noon', e.target.value)}
                      disabled={f.exists}
                      className={`w-full border rounded-lg px-2 py-1.5 text-xs mt-0.5 ${e.noon ? 'border-red-500' : 'border-gray-300'} ${f.exists ? 'bg-gray-50 text-gray-400' : ''}`}
                      placeholder="Шөл, тараг..."
                    />
                    {e.noon && <p className="text-red-500 text-xs mt-0.5">{e.noon}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Орой</label>
                    <input
                      type="text"
                      value={f.evening}
                      onChange={e => updateForm(i, 'evening', e.target.value)}
                      disabled={f.exists}
                      className={`w-full border rounded-lg px-2 py-1.5 text-xs mt-0.5 ${e.evening ? 'border-red-500' : 'border-gray-300'} ${f.exists ? 'bg-gray-50 text-gray-400' : ''}`}
                      placeholder="Жигнэмэг..."
                    />
                    {e.evening && <p className="text-red-500 text-xs mt-0.5">{e.evening}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Орц</label>
                    <input
                      type="text"
                      value={f.ingredients}
                      onChange={e => updateForm(i, 'ingredients', e.target.value)}
                      disabled={f.exists}
                      className={`w-full border rounded-lg px-2 py-1.5 text-xs mt-0.5 ${e.ingredients ? 'border-red-500' : 'border-gray-300'} ${f.exists ? 'bg-gray-50 text-gray-400' : ''}`}
                      placeholder="Гурил, мах..."
                    />
                    {e.ingredients && <p className="text-red-500 text-xs mt-0.5">{e.ingredients}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={f.allergyFlag}
                      onChange={e => updateForm(i, 'allergyFlag', e.target.checked)}
                      disabled={f.exists}
                      className="w-3 h-3"
                    />
                    <label className="text-xs text-gray-600">⚠️ Харшил</label>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Хадгалж байна...' : '7 хоногийн цэс хадгалах'}
        </button>
      </main>
    </div>
  )
}