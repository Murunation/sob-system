'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getMyFeedbacks, replyFeedback } from '@/app/actions/teacher-feedback'

type Feedback = {
  id: number
  message: string
  reply: string | null
  status: string
  createdAt: string
  parent: {
    user: { firstname: string; lastname: string }
  }
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

export default function TeacherFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [reply, setReply] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const f = await getMyFeedbacks()
    setFeedbacks(f as any)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openReply(f: Feedback) {
    setSelectedFeedback(f)
    setReply(f.reply || '')
    setErrors({})
  }

  async function handleReply() {
    const newErrors: Record<string, string> = {}

    if (!reply.trim()) {
      newErrors.reply = 'Хариу оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(reply.trim())) {
      newErrors.reply = 'Хариу зөвхөн үсэг агуулна'
    } else if (reply.trim().length < 5) {
      newErrors.reply = 'Хариу хэт богино байна'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      await replyFeedback(selectedFeedback!.id, reply)
      toast.success('Хариу амжилттай илгээгдлээ')
      setSelectedFeedback(null)
      setReply('')
      await loadData()
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  const pending = feedbacks.filter((f) => f.status === 'PENDING')
  const replied = feedbacks.filter((f) => f.status !== 'PENDING')

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="space-y-6">
        {pending.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Хариу өгөөгүй
              <span className="ml-2 normal-case font-medium text-orange-600 bg-orange-100 text-xs px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pending.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-orange-400">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {f.parent.user.lastname} {f.parent.user.firstname}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(f.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{f.message}</p>
                  <button
                    type="button"
                    onClick={() => openReply(f)}
                    className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#2d2a6e] transition"
                  >
                    Хариу өгөх
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {replied.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Хариу өгсөн</h2>
            <div className="space-y-3">
              {replied.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {f.parent.user.lastname} {f.parent.user.firstname}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[f.status]}`}>
                        {statusLabel[f.status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{f.message}</p>
                  {f.reply && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Таны хариу:</p>
                      <p className="text-sm text-blue-800">{f.reply}</p>
                    </div>
                  )}
                  {f.status === 'REPLIED' && (
                    <button
                      type="button"
                      onClick={() => openReply(f)}
                      className="text-xs text-purple-600 hover:underline mt-2 font-medium"
                    >
                      Хариу засах
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {feedbacks.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Санал хүсэлт байхгүй байна</div>
        )}
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-1 text-gray-800">Хариу өгөх</h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedFeedback.parent.user.lastname} {selectedFeedback.parent.user.firstname}
            </p>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Хүсэлт:</p>
              <p className="text-sm text-gray-700">{selectedFeedback.message}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Хариу</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  errors.reply ? 'border-red-400' : 'border-gray-200'
                }`}
                rows={4}
                placeholder="Хариугаа бичнэ үү..."
              />
              {errors.reply && <p className="text-red-500 text-xs mt-1">{errors.reply}</p>}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleReply}
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
