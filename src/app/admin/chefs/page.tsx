'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getChefs, createChef, updateChef, archiveChef } from '@/app/actions/chef'

type Chef = {
  id: number
  userId: number
  isArchived: boolean
  user: { id: number; firstname: string; lastname: string; phone: string | null; email: string; username: string }
}

const emptyForm = { firstname: '', lastname: '', phone: '', email: '', username: '', password: '' }

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/parents', label: 'Эцэг эхийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/chefs', label: 'Тогоочийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/payments', label: 'Төлбөр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
  { href: '/admin/archive', label: 'Архив', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
]

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editChef, setEditChef] = useState<Chef | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    const c = await getChefs()
    setChefs(c as any)
    setDataLoaded(true)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openAdd() { setEditChef(null); setForm(emptyForm); setErrors({}); setShowModal(true) }
  function openEdit(c: Chef) {
    setEditChef(c)
    setForm({ firstname: c.user.firstname, lastname: c.user.lastname, phone: c.user.phone || '', email: c.user.email, username: c.user.username, password: '' })
    setErrors({}); setShowModal(true)
  }

  async function handleSubmit() {
    const e: Record<string, string> = {}
    if (!form.lastname.trim()) e.lastname = 'Овог оруулна уу'
    if (!form.firstname.trim()) e.firstname = 'Нэр оруулна уу'
    if (!form.phone.trim()) e.phone = 'Утас оруулна уу'
    else if (!/^\d{8}$/.test(form.phone.trim())) e.phone = '8 оронтой тоо байх ёстой'
    if (!form.email.trim()) e.email = 'И-мэйл оруулна уу'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'И-мэйл буруу форматтай'
    if (!editChef) {
      if (!form.username.trim()) e.username = 'Нэвтрэх нэр оруулна уу'
      else if (form.username.trim().length < 4) e.username = 'Хамгийн багадаа 4 тэмдэгт'
      if (!form.password.trim()) e.password = 'Нууц үг оруулна уу'
      else if (form.password.trim().length < 8) e.password = 'Хамгийн багадаа 8 тэмдэгт'
    }
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      if (editChef) {
        await updateChef(editChef.id, { firstname: form.firstname, lastname: form.lastname, phone: form.phone, email: form.email })
        toast.success('Засагдлаа')
      } else {
        await createChef(form)
        toast.success('Нэмэгдлээ')
      }
      setShowModal(false); setErrors({})
      const c = await getChefs(); setChefs(c as any)
    } catch (err: any) { toast.error(err.message || 'Алдаа гарлаа') }
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Тогоочийг архивлах уу?')) return
    await archiveChef(id); toast.success('Архивлагдлаа')
    const c = await getChefs(); setChefs(c as any)
  }

  const filtered = chefs.filter(c =>
    `${c.user.firstname} ${c.user.lastname}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-5">
        <input
          type="text"
          placeholder="Тогооч хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-72"
        />
        <button onClick={openAdd} className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] transition w-full sm:w-auto">
          + Тогооч нэмэх
        </button>
      </div>

      {!dataLoaded ? <Skeleton /> : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Нэр</th>
                  <th className="text-left px-5 py-3 font-medium">Утас</th>
                  <th className="text-left px-5 py-3 font-medium">И-мэйл</th>
                  <th className="text-left px-5 py-3 font-medium">Нэвтрэх нэр</th>
                  <th className="text-left px-5 py-3 font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{c.user.lastname} {c.user.firstname}</td>
                    <td className="px-5 py-3 text-gray-500">{c.user.phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{c.user.email}</td>
                    <td className="px-5 py-3 text-gray-500">{c.user.username}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(c)} className="text-purple-600 hover:underline text-xs font-medium">Засах</button>
                        <button onClick={() => handleArchive(c.id)} className="text-red-400 hover:underline text-xs font-medium">Архивлах</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-300">Тогооч олдсонгүй</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="font-semibold text-gray-800">{c.user.lastname} {c.user.firstname}</p>
                <p className="text-xs text-gray-400 mb-2">{c.user.phone || '—'}</p>
                <p className="text-xs text-gray-500 mb-3">{c.user.email}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="flex-1 text-xs text-purple-600 border border-purple-200 rounded-xl py-1.5 hover:bg-purple-50">Засах</button>
                  <button onClick={() => handleArchive(c.id)} className="flex-1 text-xs text-red-400 border border-red-200 rounded-xl py-1.5 hover:bg-red-50">Архивлах</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">{editChef ? 'Тогооч засах' : 'Тогооч нэмэх'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Овог</label>
                  <input type="text" value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.lastname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.lastname && <p className="text-red-400 text-xs mt-1">{errors.lastname}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Нэр</label>
                  <input type="text" value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.firstname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.firstname && <p className="text-red-400 text-xs mt-1">{errors.firstname}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Утас</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="99001122"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">И-мэйл</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="chef@example.com"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              {!editChef && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Нэвтрэх нэр</label>
                    <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="chef01"
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.username ? 'border-red-400' : 'border-gray-200'}`} />
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Нууц үг</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`} />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Болих</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] disabled:opacity-50">
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
