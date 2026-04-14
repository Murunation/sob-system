'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
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
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editReview, setEditReview] = useState<Review | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMyGroupStudentsForReview().then((s) => setStudents(s as any))
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
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-5 min-h-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Хүүхэд сонгох</h2>
          <div className="space-y-1 max-h-[50vh] lg:max-h-none overflow-y-auto pr-1">
            {students.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStudent(s)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                  selectedStudent?.id === s.id
                    ? 'bg-[#F0EEFF] text-[#1E1B4B] font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {s.lastname} {s.firstname}
                {s.healthInfo && <span className="ml-1 text-xs text-red-500">!</span>}
              </button>
            ))}
            {students.length === 0 && <p className="text-gray-400 text-sm">Хүүхэд олдсонгүй</p>}
          </div>
        </div>

        <div className="lg:col-span-2 min-w-0">
          {selectedStudent ? (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {selectedStudent.lastname} {selectedStudent.firstname}-ийн үнэлгээ
                </h2>
                <button
                  type="button"
                  onClick={openAdd}
                  className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] transition w-full sm:w-auto shrink-0"
                >
                  + Үнэлгээ нэмэх
                </button>
              </div>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${statusColor[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
                        {r.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="text-xs text-purple-600 hover:underline font-medium"
                          >
                            Засах
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">Зан төлөв:</span> {r.behavior}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Хөгжил:</span> {r.development}
                      </p>
                      {r.note && (
                        <p>
                          <span className="font-medium text-gray-700">Тэмдэглэл:</span> {r.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">Үнэлгээ байхгүй байна</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 lg:p-10 text-center text-gray-400 shadow-sm">Хүүхэд сонгоно уу</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editReview ? 'Үнэлгээ засах' : 'Үнэлгээ нэмэх'} — {selectedStudent?.lastname} {selectedStudent?.firstname}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Зан төлөв</label>
                <textarea
                  value={form.behavior}
                  onChange={(e) => setForm({ ...form, behavior: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.behavior ? 'border-red-400' : 'border-gray-200'
                  }`}
                  rows={3}
                  placeholder="Тайван, найрсаг, нийтэч..."
                />
                {errors.behavior && <p className="text-red-500 text-xs mt-1">{errors.behavior}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Хөгжлийн үнэлгээ</label>
                <textarea
                  value={form.development}
                  onChange={(e) => setForm({ ...form, development: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.development ? 'border-red-400' : 'border-gray-200'
                  }`}
                  rows={3}
                  placeholder="Хэл ярианы ахиц сайтай..."
                />
                {errors.development && <p className="text-red-500 text-xs mt-1">{errors.development}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Нэмэлт зөвлөгөө <span className="text-gray-400 font-normal">(заавал биш)</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.note ? 'border-red-400' : 'border-gray-200'
                  }`}
                  rows={2}
                  placeholder="Гэртээ ном уншуулах..."
                />
                {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 min-w-[120px] border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="flex-1 min-w-[120px] border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Ноорог хадгалах
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('SENT')}
                disabled={loading}
                className="flex-1 min-w-[120px] bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50 transition"
              >
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
