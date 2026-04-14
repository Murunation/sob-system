'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyFeedbacks, sendFeedback } from '@/app/actions/parent'

export default function ParentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMyFeedbacks().then((f) => setFeedbacks(f as any))
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
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mb-5">
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#1E1B4B] text-white px-4 py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] transition w-full sm:w-auto"
        >
          + Санал илгээх
        </button>
      </div>

      <div className="space-y-3">
        {feedbacks.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[f.status]}`}>{statusLabel[f.status]}</span>
              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('mn-MN')}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{f.message}</p>
            {f.reply && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700 font-medium mb-1">Багшийн хариу:</p>
                <p className="text-sm text-green-900">{f.reply}</p>
              </div>
            )}
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Санал хүсэлт байхгүй байна</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Санал хүсэлт илгээх</h2>

            <div>
              <label className="text-xs font-medium text-gray-600">Санал хүсэлт</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  errors.message ? 'border-red-400' : 'border-gray-200'
                }`}
                rows={4}
                placeholder="Асуулт, санал хүсэлтээ бичнэ үү..."
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
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
