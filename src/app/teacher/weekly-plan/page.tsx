'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getMyWeeklyPlans, createWeeklyPlan, updateWeeklyPlan } from '@/app/actions/weekly-plan'

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

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default function WeeklyPlanPage() {
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

  useEffect(() => {
    loadData()
  }, [])

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
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mb-5">
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#1E1B4B] text-white px-4 py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] transition w-full sm:w-auto"
        >
          + Төлөвлөгөө нэмэх
        </button>
      </div>

      <div className="space-y-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {new Date(p.weekStart).toLocaleDateString('mn-MN')} — долоо хоног
                </h3>
                {p.monthlyEvent && (
                  <span className="text-xs bg-[#F0EEFF] text-[#6B4EFF] px-2 py-0.5 rounded-full mt-2 inline-block">
                    {p.monthlyEvent}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="text-sm text-purple-600 hover:underline font-medium shrink-0 self-start"
              >
                Засах
              </button>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line mt-3">{p.content}</p>
            <p className="text-xs text-gray-400 mt-3">
              Шинэчлэгдсэн: {new Date(p.updatedAt).toLocaleDateString('mn-MN')}
            </p>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Төлөвлөгөө байхгүй байна</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editPlan ? 'Төлөвлөгөө засах' : 'Төлөвлөгөө нэмэх'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Долоо хоногийн эхлэх огноо (Даваа)</label>
                <input
                  type="date"
                  value={form.weekStart}
                  onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
                  disabled={!!editPlan}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.weekStart ? 'border-red-400' : 'border-gray-200'
                  } ${editPlan ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                />
                {errors.weekStart && <p className="text-red-500 text-xs mt-1">{errors.weekStart}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Төлөвлөгөөний агуулга</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.content ? 'border-red-400' : 'border-gray-200'
                  }`}
                  rows={6}
                  placeholder="Даваа: Тоолох дасгал&#10;Мягмар: Зураг зурах&#10;Лхагва: Дуу хөгжим..."
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Сарын арга хэмжээ <span className="text-gray-400 font-normal">(заавал биш)</span>
                </label>
                <input
                  type="text"
                  value={form.monthlyEvent}
                  onChange={(e) => setForm({ ...form, monthlyEvent: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.monthlyEvent ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Цэцэрлэгийн баяр..."
                />
                {errors.monthlyEvent && <p className="text-red-500 text-xs mt-1">{errors.monthlyEvent}</p>}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50 transition"
              >
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
