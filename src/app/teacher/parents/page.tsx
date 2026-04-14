'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getParentsFull, updateParentById } from '@/app/actions/parent'

type ParentRow = {
  id: number
  address: string | null
  user: {
    id: number
    firstname: string
    lastname: string
    phone: string | null
    email: string
    username: string
    profileCompleted: boolean
  }
  students: { id: number; firstname: string; lastname: string }[]
}

const emptyForm = { firstname: '', lastname: '', phone: '', email: '', address: '' }

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-28" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TeacherParentsPage() {
  const [parents, setParents] = useState<ParentRow[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState<ParentRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    const p = await getParentsFull()
    setParents(p as any)
    setDataLoaded(true)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openEdit(p: ParentRow) {
    setEditTarget(p)
    setForm({
      firstname: p.user.firstname,
      lastname: p.user.lastname,
      phone: p.user.phone ?? '',
      email: p.user.email.endsWith('@parent.local') ? '' : p.user.email,
      address: p.address ?? '',
    })
    setErrors({})
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.lastname.trim()) e.lastname = 'Овог оруулна уу'
    if (!form.firstname.trim()) e.firstname = 'Нэр оруулна уу'
    if (!form.phone.trim()) e.phone = 'Утас оруулна уу'
    else if (!/^\d{8}$/.test(form.phone.trim())) e.phone = '8 оронтой байх ёстой'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Зөв имэйл оруулна уу'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      await updateParentById(editTarget!.id, {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      })
      toast.success('Хадгалагдлаа')
      setEditTarget(null)
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  const filtered = parents.filter(p =>
    `${p.user.firstname} ${p.user.lastname} ${p.user.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-5">
        <input
          type="text"
          placeholder="Хайх (нэр, утас)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-72"
        />
        <span className="text-sm text-gray-400">{filtered.length} эцэг эх</span>
      </div>

      {!dataLoaded ? <Skeleton /> : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Нэр</th>
                  <th className="text-left px-5 py-3 font-medium">Утас / Нэвтрэх нэр</th>
                  <th className="text-left px-5 py-3 font-medium">Имэйл</th>
                  <th className="text-left px-5 py-3 font-medium">Хүүхэд</th>
                  <th className="text-left px-5 py-3 font-medium">Профайл</th>
                  <th className="text-left px-5 py-3 font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.user.lastname} {p.user.firstname}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <p>{p.user.phone ?? '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.user.username}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {p.user.email.endsWith('@parent.local') ? (
                        <span className="text-orange-400">Тохируулаагүй</span>
                      ) : p.user.email}
                    </td>
                    <td className="px-5 py-3">
                      {p.students.length > 0 ? (
                        <div className="space-y-0.5">
                          {p.students.map(s => (
                            <p key={s.id} className="text-xs text-gray-600">{s.lastname} {s.firstname}</p>
                          ))}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {p.user.profileCompleted ? (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Дүүрсэн</span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Дутуу</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => openEdit(p)} className="text-purple-600 hover:underline text-xs font-medium">Засах</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-300">Эцэг эх олдсонгүй</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{p.user.lastname} {p.user.firstname}</p>
                    <p className="text-xs text-gray-400">{p.user.phone ?? '—'}</p>
                  </div>
                  {p.user.profileCompleted ? (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Дүүрсэн</span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Дутуу</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2 font-mono">{p.user.username}</div>
                {p.students.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {p.students.map(s => (
                      <span key={s.id} className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg text-xs">{s.lastname} {s.firstname}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => openEdit(p)} className="w-full text-xs text-purple-600 border border-purple-200 rounded-xl py-1.5 hover:bg-purple-50">Засах</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-300">Эцэг эх олдсонгүй</div>
            )}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Эцэг эх засах</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Овог</label>
                  <input value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.lastname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.lastname && <p className="text-red-400 text-xs mt-1">{errors.lastname}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Нэр</label>
                  <input value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.firstname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.firstname && <p className="text-red-400 text-xs mt-1">{errors.firstname}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Утасны дугаар</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Имэйл <span className="text-gray-300">(заавал биш)</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Гэрийн хаяг <span className="text-gray-300">(заавал биш)</span></label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400">Нэвтрэх нэр: <span className="font-mono font-semibold text-gray-600">{editTarget.user.username}</span></p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditTarget(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Болих</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50">
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
