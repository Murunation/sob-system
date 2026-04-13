'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const f = await getAdminFeedbacks()
    setFeedbacks(f as any)
  }

  useEffect(() => { loadData() }, [])

  async function handleResolve(id: number) {
    if (!confirm('Энэ санал хүсэлтийг шийдвэрлэсэн болгох уу?')) return
    setLoading(true)
    await resolveFeedback(id)
    toast.success('Санал хүсэлт шийдвэрлэгдлээ')
    await loadData()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Санал хүсэлт</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-3">
          {feedbacks.map(f => (
            <div key={f.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-800">
                    {f.parent.user.lastname} {f.parent.user.firstname}
                    <span className="text-gray-400 font-normal mx-2">→</span>
                    Багш: {f.teacher.user.lastname} {f.teacher.user.firstname}
                  </p>
                </div>
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
                <div className="bg-blue-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-600 font-medium mb-1">Багшийн хариу:</p>
                  <p className="text-sm text-blue-800">{f.reply}</p>
                </div>
              )}

              {f.status === 'REPLIED' && (
                <button
                  onClick={() => handleResolve(f.id)}
                  disabled={loading}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Шийдвэрлэсэн болгох
                </button>
              )}
            </div>
          ))}
          {feedbacks.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Санал хүсэлт байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}