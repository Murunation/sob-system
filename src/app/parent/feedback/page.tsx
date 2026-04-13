'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getMyFeedbacks, sendFeedback } from '@/app/actions/parent'

export default function ParentFeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMyFeedbacks().then(f => setFeedbacks(f as any))
  }, [])

  function openAdd() {
    setMessage('')
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}

    if (!message.trim()) {
      newErrors.message = 'Санал хүсэлт оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(message.trim())) {
      newErrors.message = 'Санал хүсэлт зөвхөн үсэг агуулна'
    } else if (message.trim().length < 5) {
      newErrors.message = 'Санал хүсэлт хэт богино байна'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      await sendFeedback({ message })
      toast.success('Санал хүсэлт амжилттай илгээгдлээ')
      setShowModal(false)
      const f = await getMyFeedbacks()
      setFeedbacks(f as any)
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Хариу хүлээж байна',
    REPLIED: 'Хариу ирсэн',
    RESOLVED: 'Шийдвэрлэсэн',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-600',
    REPLIED: 'bg-green-100 text-green-600',
    RESOLVED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Санал хүсэлт</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Санал илгээх
        </button>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <div className="space-y-3">
          {feedbacks.map(f => (
            <div key={f.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[f.status]}`}>
                  {statusLabel[f.status]}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(f.createdAt).toLocaleDateString('mn-MN')}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{f.message}</p>
              {f.reply && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Багшийн хариу:</p>
                  <p className="text-sm text-green-800">{f.reply}</p>
                </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Санал хүсэлт илгээх</h2>

            <div>
              <label className="text-sm font-medium text-gray-700">Санал хүсэлт</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                rows={4}
                placeholder="Асуулт, санал хүсэлтээ бичнэ үү..."
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
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