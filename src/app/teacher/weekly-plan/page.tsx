'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getMyWeeklyPlans,
  createWeeklyPlan,
  updateWeeklyPlan,
} from '@/app/actions/weekly-plan'

type WeeklyPlan = {
  id: number
  weekStart: string
  content: string
  monthlyEvent: string | null
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  weekStart: '',
  content: '',
  monthlyEvent: '',
}

// Даваа гарагийг олох
function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default function WeeklyPlanPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<WeeklyPlan[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState<WeeklyPlan | null>(null)
  const [form, setForm] = useState({ ...emptyForm, weekStart: getMonday(new Date()) })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const p = await getMyWeeklyPlans()
    setPlans(p as any)
  }

  useEffect(() => { loadData() }, [])

  function openAdd() {
    setEditPlan(null)
    setForm({ ...emptyForm, weekStart: getMonday(new Date()) })
    setErrors({})
    setShowModal(true)
  }

  function openEdit(p: WeeklyPlan) {
    setEditPlan(p)
    setForm({
      weekStart: new Date(p.weekStart).toISOString().split('T')[0],
      content: p.content,
      monthlyEvent: p.monthlyEvent || '',
    })
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}

    if (!form.weekStart) {
      newErrors.weekStart = 'Долоо хоногийн эхлэх огноо сонгоно уу'
    }

    if (!form.content.trim()) {
      newErrors.content = 'Төлөвлөгөөний агуулга оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s.:,!?()\n-]+$/.test(form.content.trim())) {
      newErrors.content = 'Агуулга зөвхөн үсэг агуулна'
    } else if (form.content.trim().length < 10) {
      newErrors.content = 'Агуулга хэт богино байна (хамгийн багадаа 10 тэмдэгт)'
    }

    if (form.monthlyEvent.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(form.monthlyEvent.trim())) {
      newErrors.monthlyEvent = 'Арга хэмжээний нэр зөвхөн үсэг агуулна'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      if (editPlan) {
        await updateWeeklyPlan(editPlan.id, {
          content: form.content,
          monthlyEvent: form.monthlyEvent,
        })
        toast.success('Төлөвлөгөө амжилттай засагдлаа')
      } else {
        await createWeeklyPlan(form)
        toast.success('Төлөвлөгөө амжилттай нэмэгдлээ')
      }
      setShowModal(false)
      setErrors({})
      await loadData()
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/teacher')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">7 хоногийн төлөвлөгөө</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Төлөвлөгөө нэмэх
        </button>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {plans.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {new Date(p.weekStart).toLocaleDateString('mn-MN')} — долоо хоног
                  </h3>
                  {p.monthlyEvent && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      📅 {p.monthlyEvent}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openEdit(p)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Засах
                </button>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{p.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                Шинэчлэгдсэн: {new Date(p.updatedAt).toLocaleDateString('mn-MN')}
              </p>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Төлөвлөгөө байхгүй байна
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              {editPlan ? 'Төлөвлөгөө засах' : 'Төлөвлөгөө нэмэх'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Долоо хоногийн эхлэх огноо (Даваа)
                </label>
                <input
                  type="date"
                  value={form.weekStart}
                  onChange={e => setForm({ ...form, weekStart: e.target.value })}
                  disabled={!!editPlan}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${
                    errors.weekStart ? 'border-red-500' : 'border-gray-300'
                  } ${editPlan ? 'bg-gray-50 text-gray-400' : ''}`}
                />
                {errors.weekStart && <p className="text-red-500 text-xs mt-1">{errors.weekStart}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Төлөвлөгөөний агуулга</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                  rows={6}
                  placeholder="Даваа: Тоолох дасгал&#10;Мягмар: Зураг зурах&#10;Лхагва: Дуу хөгжим..."
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Сарын арга хэмжээ
                  <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
                </label>
                <input
                  type="text"
                  value={form.monthlyEvent}
                  onChange={e => setForm({ ...form, monthlyEvent: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.monthlyEvent ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Цэцэрлэгийн баяр..."
                />
                {errors.monthlyEvent && <p className="text-red-500 text-xs mt-1">{errors.monthlyEvent}</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Болих
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}