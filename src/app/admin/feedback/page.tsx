'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getAdminFeedbacks, resolveFeedback } from '@/app/actions/admin'

type Feedback = {
  id: number
  message: string
  reply: string | null
  status: string
  createdAt: string
  parent: { user: { firstname: string; lastname: string } }
  teacher: { user: { firstname: string; lastname: string } }
}

const statusLabel: Record<string, string> = {
  PENDING: 'Хариу өгөөгүй',
  REPLIED: 'Хариу өгсөн',
  RESOLVED: 'Шийдвэрлэсэн',
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-600',
  REPLIED: 'bg-blue-100 text-blue-600',
  RESOLVED: 'bg-green-100 text-green-600',
}

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
]

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const f = await getAdminFeedbacks()
    setFeedbacks(f as any)
  }

  useEffect(() => { loadData() }, [])

  async function handleResolve(id: number) {
    if (!confirm('Санал хүсэлтийг шийдвэрлэсэн болгох уу?')) return
    setLoading(true)
    await resolveFeedback(id)
    toast.success('Шийдвэрлэгдлээ')
    await loadData()
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="space-y-3">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-gray-800 text-sm">
                {f.parent.user.lastname} {f.parent.user.firstname}
                <span className="text-gray-400 mx-2">→</span>
                {f.teacher.user.lastname} {f.teacher.user.firstname}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[f.status]}`}>
                  {statusLabel[f.status]}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(f.createdAt).toLocaleDateString('mn-MN')}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{f.message}</p>
            {f.reply && (
              <div className="bg-blue-50 rounded-xl p-3 mb-2">
                <p className="text-xs text-blue-600 font-medium mb-1">Багшийн хариу:</p>
                <p className="text-sm text-blue-800">{f.reply}</p>
              </div>
            )}
            {f.status === 'REPLIED' && (
              <button
                onClick={() => handleResolve(f.id)}
                disabled={loading}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                Шийдвэрлэсэн болгох
              </button>
            )}
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300">
            Санал хүсэлт байхгүй байна
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}