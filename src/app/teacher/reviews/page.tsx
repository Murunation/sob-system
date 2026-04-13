'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getMyGroupStudentsForReview,
  getStudentReviews,
  createReview,
  updateReview,
} from '@/app/actions/review'

type Student = {
  id: number
  firstname: string
  lastname: string
  healthInfo: string | null
}

type Review = {
  id: number
  behavior: string | null
  development: string | null
  note: string | null
  status: string
  createdAt: string
}

const emptyForm = {
  behavior: '',
  development: '',
  note: '',
  status: 'DRAFT' as 'DRAFT' | 'SENT',
}

export default function ReviewsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editReview, setEditReview] = useState<Review | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMyGroupStudentsForReview().then(s => setStudents(s as any))
  }, [])

  async function selectStudent(s: Student) {
    setSelectedStudent(s)
    const r = await getStudentReviews(s.id)
    setReviews(r as any)
  }

  function openAdd() {
    setEditReview(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(r: Review) {
    setEditReview(r)
    setForm({
      behavior: r.behavior || '',
      development: r.development || '',
      note: r.note || '',
      status: r.status as 'DRAFT' | 'SENT',
    })
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit(status: 'DRAFT' | 'SENT') {
    const newErrors: Record<string, string> = {}

    if (!form.behavior.trim()) {
      newErrors.behavior = 'Зан төлөв оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(form.behavior.trim())) {
      newErrors.behavior = 'Зан төлөв зөвхөн үсэг агуулна'
    } else if (form.behavior.trim().length < 5) {
      newErrors.behavior = 'Зан төлөв хэт богино байна'
    }

    if (!form.development.trim()) {
      newErrors.development = 'Хөгжлийн үнэлгээ оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(form.development.trim())) {
      newErrors.development = 'Хөгжлийн үнэлгээ зөвхөн үсэг агуулна'
    } else if (form.development.trim().length < 5) {
      newErrors.development = 'Хөгжлийн үнэлгээ хэт богино байна'
    }

    if (form.note.trim() && !/^[А-ЯӨҮа-яөүA-Za-z\s.,!?()-]+$/.test(form.note.trim())) {
      newErrors.note = 'Тэмдэглэл зөвхөн үсэг агуулна'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      if (editReview) {
        await updateReview(editReview.id, { ...form, status })
        toast.success(status === 'SENT' ? 'Үнэлгээ илгээгдлээ' : 'Ноорог хадгалагдлаа')
      } else {
        await createReview({ ...form, status, studentId: selectedStudent!.id })
        toast.success(status === 'SENT' ? 'Үнэлгээ илгээгдлээ' : 'Ноорог хадгалагдлаа')
      }
      setShowModal(false)
      setErrors({})
      const r = await getStudentReviews(selectedStudent!.id)
      setReviews(r as any)
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    DRAFT: 'Ноорог',
    SENT: 'Илгээсэн',
    READ: 'Уншсан',
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SENT: 'bg-blue-100 text-blue-600',
    READ: 'bg-green-100 text-green-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/teacher')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Хөгжлийн үнэлгээ</h1>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Хүүхдийн жагсаалт */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Хүүхэд сонгох</h2>
            <div className="space-y-2">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedStudent?.id === s.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {s.lastname} {s.firstname}
                  {s.healthInfo && <span className="ml-1 text-xs text-red-500">⚠️</span>}
                </button>
              ))}
              {students.length === 0 && (
                <p className="text-gray-400 text-sm">Хүүхэд олдсонгүй</p>
              )}
            </div>
          </div>

          {/* Үнэлгээний жагсаалт */}
          <div className="md:col-span-2">
            {selectedStudent ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-700">
                    {selectedStudent.lastname} {selectedStudent.firstname}-ийн үнэлгээ
                  </h2>
                  <button
                    onClick={openAdd}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                  >
                    + Үнэлгээ нэмэх
                  </button>
                </div>

                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>
                          {statusLabel[r.status]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                          </span>
                          {r.status === 'DRAFT' && (
                            <button
                              onClick={() => openEdit(r)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Засах
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium text-gray-600">Зан төлөв:</span> {r.behavior}</p>
                        <p><span className="font-medium text-gray-600">Хөгжил:</span> {r.development}</p>
                        {r.note && <p><span className="font-medium text-gray-600">Тэмдэглэл:</span> {r.note}</p>}
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                      Үнэлгээ байхгүй байна
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                Хүүхэд сонгоно уу
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              {editReview ? 'Үнэлгээ засах' : 'Үнэлгээ нэмэх'} — {selectedStudent?.lastname} {selectedStudent?.firstname}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Зан төлөв</label>
                <textarea
                  value={form.behavior}
                  onChange={e => setForm({ ...form, behavior: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.behavior ? 'border-red-500' : 'border-gray-300'}`}
                  rows={3}
                  placeholder="Тайван, найрсаг, нийтэч..."
                />
                {errors.behavior && <p className="text-red-500 text-xs mt-1">{errors.behavior}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Хөгжлийн үнэлгээ</label>
                <textarea
                  value={form.development}
                  onChange={e => setForm({ ...form, development: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.development ? 'border-red-500' : 'border-gray-300'}`}
                  rows={3}
                  placeholder="Хэл ярианы ахиц сайтай..."
                />
                {errors.development && <p className="text-red-500 text-xs mt-1">{errors.development}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Нэмэлт зөвлөгөө
                  <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}
                  rows={2}
                  placeholder="Гэртээ ном уншуулах..."
                />
                {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Болих
              </button>
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Ноорог хадгалах
              </button>
              <button
                onClick={() => handleSubmit('SENT')}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}