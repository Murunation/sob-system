'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getChefReports, createChefReport } from '@/app/actions/chef-report'

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

const reportTypes = [
  'Өдрийн хоолны тайлан',
  'Сарын хоолны тайлан',
  'Хоолны нэгдсэн тайлан',
]

const today = new Date().toISOString().split('T')[0]
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0]

export default function ChefReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: '', startDate: firstDay, endDate: today })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const r = await getChefReports()
    setReports(r as any)
  }

  useEffect(() => { loadData() }, [])

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

    setLoading(true)
    try {
      await createChefReport({
        type: form.type,
        dateRange: `${form.startDate}-${form.endDate}`,
      })
      toast.success('Тайлан амжилттай илгээгдлээ')
      setShowModal(false)
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
          <button onClick={() => router.push('/chef')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Хоолны тайлан</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Тайлан илгээх
        </button>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{r.type}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.dateRange}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>
                    {statusLabel[r.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                  </span>
                </div>
              </div>
              {r.status === 'RETURNED' && (
                <div className="mt-2 bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-red-600">⚠️ Эрхлэгч буцаасан — засварлаж дахин илгээнэ үү</p>
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Тайлан байхгүй байна
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Тайлан илгээх</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Тайлангийн төрөл</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Сонгох...</option>
                  {reportTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Эхлэх огноо</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Дуусах огноо</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {form.startDate && form.endDate && (
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500">Хугацааны хүрээ:</p>
                  <p className="text-sm font-medium text-gray-700">{form.startDate} — {form.endDate}</p>
                </div>
              )}
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
                {loading ? 'Илгээж байна...' : 'Илгээх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}