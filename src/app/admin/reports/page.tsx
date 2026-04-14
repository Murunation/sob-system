'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getAdminReports, confirmReport, returnReport } from '@/app/actions/admin'

type Report = { id: number; type: string; dateRange: string; status: string; createdAt: string }

const statusLabel: Record<string, string> = { SENT: 'Илгээсэн', CONFIRMED: 'Баталгаажсан', RETURNED: 'Буцаасан' }
const statusColor: Record<string, string> = { SENT: 'bg-blue-100 text-blue-600', CONFIRMED: 'bg-green-100 text-green-600', RETURNED: 'bg-red-100 text-red-600' }

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
]

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)

  async function loadData() { const r = await getAdminReports(); setReports(r as any) }
  useEffect(() => { loadData() }, [])

  async function handleConfirm(id: number) {
    if (!confirm('Тайланг баталгаажуулах уу?')) return
    setLoading(true); await confirmReport(id); toast.success('Тайлан баталгаажлаа'); await loadData(); setLoading(false)
  }
  async function handleReturn(id: number) {
    if (!confirm('Тайланг буцаах уу?')) return
    setLoading(true); await returnReport(id); toast.success('Тайлан буцаагдлаа'); await loadData(); setLoading(false)
  }

  const sent = reports.filter(r => r.status === 'SENT')
  const others = reports.filter(r => r.status !== 'SENT')

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      {sent.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Хүлээгдэж буй <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full normal-case">{sent.length}</span>
          </h2>
          <div className="space-y-3">
            {sent.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-purple-400">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{r.type}</h3>
                    <p className="text-sm text-gray-400">{r.dateRange}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleConfirm(r.id)} disabled={loading}
                    className="flex-1 bg-green-600 text-white py-1.5 rounded-xl text-xs hover:bg-green-700 disabled:opacity-50">✓ Батлах</button>
                  <button onClick={() => handleReturn(r.id)} disabled={loading}
                    className="flex-1 bg-red-500 text-white py-1.5 rounded-xl text-xs hover:bg-red-600 disabled:opacity-50">✗ Буцаах</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Бүх тайлан</h2>
        <div className="space-y-3">
          {others.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{r.type}</h3>
                  <p className="text-sm text-gray-400">{r.dateRange}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
                </div>
              </div>
            </div>
          ))}
          {others.length === 0 && sent.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-300">Тайлан байхгүй байна</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}