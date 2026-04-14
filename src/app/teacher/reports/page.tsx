'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getMyReports, createReport } from '@/app/actions/teacher-report'

type Report = {
  id: number
  type: string
  dateRange: string
  status: string
  createdAt: string
}

const statusLabel: Record<string, string> = {
  SENT: 'Илгээсэн',
  CONFIRMED: 'Баталгаажсан',
  RETURNED: 'Буцаасан',
}

const statusColor: Record<string, string> = {
  SENT: 'bg-blue-100 text-blue-600',
  CONFIRMED: 'bg-green-100 text-green-600',
  RETURNED: 'bg-red-100 text-red-600',
}

const reportTypes = ['Ирцийн тайлан', 'Хоолны тайлан', 'Хөгжлийн тайлан', 'Сарын нэгдсэн тайлан']

const today = new Date().toISOString().split('T')[0]
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    type: '',
    startDate: firstDay,
    endDate: today,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const r = await getMyReports()
    setReports(r as any)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openAdd() {
    setForm({ type: '', startDate: firstDay, endDate: today })
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}

    if (!form.type) newErrors.type = 'Тайлангийн төрөл сонгоно уу'
    if (!form.startDate) newErrors.startDate = 'Эхлэх огноо сонгоно уу'
    if (!form.endDate) newErrors.endDate = 'Дуусах огноо сонгоно уу'
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = 'Дуусах огноо эхлэх огноогоос хойш байх ёстой'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const dateRange = `${form.startDate}-${form.endDate}`

    setLoading(true)
    try {
      await createReport({ type: form.type, dateRange })
      toast.success('Тайлан амжилттай илгээгдлээ')
      setShowModal(false)
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
          + Тайлан илгээх
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800">{r.type}</h3>
                <p className="text-sm text-gray-500 mt-1 break-all">{r.dateRange}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
              </div>
            </div>
            {r.status === 'RETURNED' && (
              <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
                <p className="text-xs text-red-600">Эрхлэгч буцаасан — засварлаж дахин илгээнэ үү</p>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Тайлан байхгүй байна</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Тайлан илгээх</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Тайлангийн төрөл</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.type ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <option value="">Сонгох...</option>
                  {reportTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Эхлэх огноо</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      errors.startDate ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Дуусах огноо</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      errors.endDate ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {form.startDate && form.endDate && (
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500">Хугацааны хүрээ:</p>
                  <p className="text-sm font-medium text-gray-700 break-all">
                    {form.startDate} — {form.endDate}
                  </p>
                </div>
              )}
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
                {loading ? 'Илгээж байна...' : 'Илгээх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
