'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getTeachers, createTeacher, updateTeacher, archiveTeacher } from '@/app/actions/teacher'

type Teacher = {
  id: number
  profession: string | null
  isArchived: boolean
  user: { firstname: string; lastname: string; phone: string | null; email: string; username: string }
  group: { id: number; name: string } | null
}

const emptyForm = { firstname: '', lastname: '', phone: '', email: '', username: '', password: '', profession: '' }

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
]

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  async function loadData() {
    const t = await getTeachers()
    setTeachers(t as any)
  }
  useEffect(() => { loadData() }, [])

  function openAdd() { setEditTeacher(null); setForm(emptyForm); setErrors({}); setShowModal(true) }
  function openEdit(t: Teacher) {
    setEditTeacher(t)
    setForm({ firstname: t.user.firstname, lastname: t.user.lastname, phone: t.user.phone || '', email: t.user.email, username: t.user.username, password: '', profession: t.profession || '' })
    setErrors({}); setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}
    if (!form.lastname.trim()) newErrors.lastname = 'Овог оруулна уу'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.lastname.trim())) newErrors.lastname = 'Овог зөвхөн үсэг агуулна'
    if (!form.firstname.trim()) newErrors.firstname = 'Нэр оруулна уу'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.firstname.trim())) newErrors.firstname = 'Нэр зөвхөн үсэг агуулна'
    if (!form.phone.trim()) newErrors.phone = 'Утас оруулна уу'
    else if (!/^[0-9]{8}$/.test(form.phone.trim())) newErrors.phone = '8 оронтой тоо байх ёстой'
    if (!form.email.trim()) newErrors.email = 'И-мэйл оруулна уу'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'И-мэйл буруу форматтай'
    if (!form.profession.trim()) newErrors.profession = 'Мэргэжил оруулна уу'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.profession.trim())) newErrors.profession = 'Мэргэжил зөвхөн үсэг агуулна'
    if (!editTeacher) {
      if (!form.username.trim()) newErrors.username = 'Нэвтрэх нэр оруулна уу'
      else if (form.username.trim().length < 4) newErrors.username = 'Хамгийн багадаа 4 тэмдэгт'
      if (!form.password.trim()) newErrors.password = 'Нууц үг оруулна уу'
      else if (form.password.trim().length < 8) newErrors.password = 'Хамгийн багадаа 8 тэмдэгт'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setLoading(true)
    try {
      if (editTeacher) { await updateTeacher(editTeacher.id, form); toast.success('Багшийн мэдээлэл засагдлаа') }
      else { await createTeacher(form); toast.success('Багш нэмэгдлээ') }
      setShowModal(false); setErrors({}); await loadData()
    } catch (e: any) { toast.error(e.message || 'Алдаа гарлаа') }
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Энэ багшийг архивлах уу?')) return
    await archiveTeacher(id); toast.success('Багш архивлагдлаа'); await loadData()
  }

  const filtered = teachers.filter(t => `${t.user.firstname} ${t.user.lastname}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="flex justify-between items-center mb-5">
        <input type="text" placeholder="Багш хайх..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-72" />
        <button onClick={openAdd} className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] transition">
          + Багш нэмэх
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Нэр</th>
              <th className="text-left px-5 py-3 font-medium">Мэргэжил</th>
              <th className="text-left px-5 py-3 font-medium">Утас</th>
              <th className="text-left px-5 py-3 font-medium">И-мэйл</th>
              <th className="text-left px-5 py-3 font-medium">Бүлэг</th>
              <th className="text-left px-5 py-3 font-medium">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-gray-800">{t.user.lastname} {t.user.firstname}</td>
                <td className="px-5 py-3 text-gray-500">{t.profession || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{t.user.phone || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{t.user.email}</td>
                <td className="px-5 py-3 text-gray-600">{t.group?.name || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(t)} className="text-purple-600 hover:underline text-xs font-medium">Засах</button>
                    <button onClick={() => handleArchive(t.id)} className="text-red-400 hover:underline text-xs font-medium">Архивлах</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-300">Багш олдсонгүй</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-gray-800">{editTeacher ? 'Багш засах' : 'Багш нэмэх'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Овог</label>
                  <input type="text" value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.lastname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.lastname && <p className="text-red-400 text-xs mt-1">{errors.lastname}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Нэр</label>
                  <input type="text" value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.firstname ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.firstname && <p className="text-red-400 text-xs mt-1">{errors.firstname}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Мэргэжил</label>
                <input type="text" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} placeholder="Сургагч багш"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.profession ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.profession && <p className="text-red-400 text-xs mt-1">{errors.profession}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Утас</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="99001122"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">И-мэйл</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="teacher@sob.mn"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              {!editTeacher && <>
                <div>
                  <label className="text-xs font-medium text-gray-600">Нэвтрэх нэр</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.username ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Нууц үг</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
              </>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">Болих</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50">
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}