// ============================================
// GROUPS PAGE
// ============================================
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getGroups, createGroup, updateGroup, archiveGroup } from '@/app/actions/group'
import { getTeachers } from '@/app/actions/teacher'

type Group = { id: number; name: string; ageRange: string; capacity: number; isArchived: boolean; teacher: { id: number; user: { firstname: string; lastname: string } } | null }
type Teacher = { id: number; user: { firstname: string; lastname: string } }

const emptyForm = { name: '', ageRange: '', capacity: 25, teacherId: 0 }

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/chefs', label: 'Тогоочийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { href: '/admin/payments', label: 'Төлбөр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
  { href: '/admin/archive', label: 'Архив', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const [g, t] = await Promise.all([getGroups(), getTeachers()])
    setGroups(g as any); setTeachers(t as any)
  }
  useEffect(() => { loadData() }, [])

  function openAdd() { setEditGroup(null); setForm(emptyForm); setErrors({}); setShowModal(true) }
  function openEdit(g: Group) {
    setEditGroup(g)
    setForm({ name: g.name, ageRange: g.ageRange, capacity: g.capacity, teacherId: g.teacher?.id || 0 })
    setErrors({}); setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Бүлгийн нэр оруулна уу'
    else if (form.name.trim().length < 2) newErrors.name = 'Нэр хэт богино'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.name.trim())) newErrors.name = 'Нэр зөвхөн үсэг агуулна'
    if (!form.ageRange.trim()) newErrors.ageRange = 'Насны ангилал оруулна уу'
    if (!form.capacity || form.capacity < 1) newErrors.capacity = 'Хүүхдийн тоо оруулна уу'
    else if (form.capacity > 50) newErrors.capacity = '50-аас хэтрэхгүй байх ёстой'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setLoading(true)
    const data = { name: form.name, ageRange: form.ageRange, capacity: form.capacity, teacherId: form.teacherId || undefined }
    if (editGroup) { await updateGroup(editGroup.id, data); toast.success('Бүлэг засагдлаа') }
    else { await createGroup(data); toast.success('Бүлэг нэмэгдлээ') }
    setShowModal(false); setErrors({}); await loadData(); setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Энэ бүлгийг архивлах уу?')) return
    await archiveGroup(id); toast.success('Бүлэг архивлагдлаа'); await loadData()
  }

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="flex justify-end mb-5">
        <button onClick={openAdd} className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] transition">
          + Бүлэг нэмэх
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{g.name}</h3>
                <p className="text-sm text-gray-400">{g.ageRange}</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{g.capacity} хүүхэд</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium">Багш: </span>
              {g.teacher ? `${g.teacher.user.lastname} ${g.teacher.user.firstname}` : 'Хуваарилагдаагүй'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(g)} className="flex-1 text-sm text-purple-600 border border-purple-200 rounded-xl py-1.5 hover:bg-purple-50 transition">Засах</button>
              <button onClick={() => handleArchive(g.id)} className="flex-1 text-sm text-red-400 border border-red-200 rounded-xl py-1.5 hover:bg-red-50 transition">Архивлах</button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <div className="col-span-3 text-center text-gray-300 py-12">Бүлэг олдсонгүй</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-gray-800">{editGroup ? 'Бүлэг засах' : 'Бүлэг нэмэх'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Бүлгийн нэр</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Наран бүлэг"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Насны ангилал</label>
                <input type="text" value={form.ageRange} onChange={e => setForm({ ...form, ageRange: e.target.value })} placeholder="3-4 нас"
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.ageRange ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.ageRange && <p className="text-red-400 text-xs mt-1">{errors.ageRange}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Хүүхдийн дээд тоо</label>
                <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.capacity ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.capacity && <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Багш <span className="text-gray-300">(заавал биш)</span></label>
                <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value={0}>Сонгох...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.user.lastname} {t.user.firstname}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Болих</button>
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
