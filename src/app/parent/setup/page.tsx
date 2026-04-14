'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { completeProfile } from '@/app/actions/parent'

export default function ParentSetupPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({ email: '', address: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email.trim()) e.email = 'Имэйл хаяг оруулна уу'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Зөв имэйл хаяг оруулна уу'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await completeProfile({ email: form.email.trim(), address: form.address.trim() || undefined })
      // JWT токенийг шинэчилж profileCompleted = true болгоно
      await update()
      router.push('/parent')
    } catch (err: any) {
      setErrors({ email: err.message || 'Алдаа гарлаа' })
    }
    setLoading(false)
  }

  const parentName = session?.user?.name ?? ''

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Тавтай морилно уу!</h1>
          {parentName && (
            <p className="text-gray-500 mt-1 text-sm">{parentName}</p>
          )}
          <p className="text-gray-400 text-sm mt-2 max-w-xs">
            Системд анх удаа нэвтэрч байна. Та доорх мэдээллийг бөглөн профайлаа дүүргэнэ үү.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Имэйл хаяг <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Гэрийн хаяг <span className="text-gray-300">(заавал биш)</span>
              </label>
              <textarea
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="УБ хот, Сүхбаатар дүүрэг г.м"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6B4EFF] text-white font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-300 mt-4">© 2026 СӨБ Систем</p>
      </div>
    </div>
  )
}
