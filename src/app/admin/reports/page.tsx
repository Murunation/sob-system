'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getAdminReports, confirmReport, returnReport } from '@/app/actions/admin'

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

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const r = await getAdminReports()
    setReports(r as any)
  }

  useEffect(() => { loadData() }, [])

  async function handleConfirm(id: number) {
    if (!confirm('Энэ тайланг баталгаажуулах уу?')) return
    setLoading(true)
    await confirmReport(id)
    toast.success('Тайлан баталгаажлаа')
    await loadData()
    setLoading(false)
  }

  async function handleReturn(id: number) {
    if (!confirm('Энэ тайланг буцаах уу?')) return
    setLoading(true)
    await returnReport(id)
    toast.success('Тайлан буцаагдлаа')
    await loadData()
    setLoading(false)
  }

  const sent = reports.filter(r => r.status === 'SENT')
  const others = reports.filter(r => r.status !== 'SENT')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Тайлан</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {sent.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">
              Хүлээгдэж буй
              <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{sent.length}</span>
            </h2>
            <div className="space-y-3">
              {sent.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{r.type}</h3>
                      <p className="text-sm text-gray-500">{r.dateRange}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(r.id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Батлах
                    </button>
                    <button
                      onClick={() => handleReturn(r.id)}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs hover:bg-red-600 disabled:opacity-50"
                    >
                      ✗ Буцаах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Бүх тайлан</h2>
          <div className="space-y-3">
            {others.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{r.type}</h3>
                    <p className="text-sm text-gray-500">{r.dateRange}</p>
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
              </div>
            ))}
            {others.length === 0 && sent.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                Тайлан байхгүй байна
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}