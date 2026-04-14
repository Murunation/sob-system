'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getStudents, createStudent, updateStudent, archiveStudent } from '@/app/actions/student'
import { getGroups } from '@/app/actions/group'
import { inviteParent, type InviteParentResult } from '@/app/actions/parent'

type Student = {
  id: number; firstname: string; lastname: string; birthDate: string
  groupId: number | null; parentId: number | null; healthInfo: string | null; status: string
  group: { id: number; name: string } | null
  parent: { id: number; user: { firstname: string; lastname: string } } | null
}
type Group = { id: number; name: string }

const emptyForm = { firstname: '', lastname: '', birthDate: '', groupId: 0, healthInfo: '' }
const emptyInvite = { lastname: '', firstname: '', phone: '', email: '' }

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Invite Parent Modal ────────────────────────────────────────────────────────

type CredentialResult = Extract<InviteParentResult, { ok: true; existing: false }>

function InviteModal({
  student,
  onClose,
  onDone,
}: {
  student: Student
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState(emptyInvite)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<CredentialResult | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.lastname.trim()) e.lastname = 'Овог оруулна уу'
    if (!form.firstname.trim()) e.firstname = 'Нэр оруулна уу'
    if (!form.phone.trim()) e.phone = 'Утасны дугаар оруулна уу'
    else if (!/^\d{8}$/.test(form.phone.trim())) e.phone = '8 оронтой тоо байх ёстой'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setLoading(true)
    try {
      const result = await inviteParent(student.id, form)
      if (!result.ok) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      if (result.existing) {
        toast.success(`${result.parentName} холбогдлоо`)
        onDone()
        onClose()
        return
      }
      setCredentials(result)
      onDone()
    } catch {
      toast.error('Алдаа гарлаа')
    }
    setLoading(false)
  }

  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg width="24" height="24" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Амжилттай бүртгэлээ!</h2>
            <p className="text-sm text-gray-500 mt-1">{credentials.parentName}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide text-center">Нэвтрэх мэдээлэл</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Нэвтрэх нэр</span>
              <span className="font-mono font-semibold text-gray-800 text-sm select-all">{credentials.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Нууц үг</span>
              <span className="font-mono font-semibold text-gray-800 text-sm select-all">{credentials.password}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mb-4">Эцэг эхэд энэ мэдээллийг өгнө үү. Нэвтрэх нэр = утасны дугаар</p>
          <button onClick={onClose} className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition">
            Хаах
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-1 text-gray-800">Эцэг эх холбох</h2>
        <p className="text-sm text-gray-400 mb-4">
          {student.lastname} {student.firstname}
        </p>
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
            <label className="text-xs font-medium text-gray-600">Утасны дугаар <span className="text-purple-500">(нэвтрэх нэр болно)</span></label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="99112233"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Имэйл <span className="text-gray-300">(заавал биш)</span></label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="example@gmail.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            Хэрэв утасны дугаар аль хэдийн бүртгэлтэй бол тухайн эцэг эхийг хүүхэдтэй холбоно.
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Болих</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50">
            {loading ? 'Хадгалж байна...' : 'Холбох'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [inviteTarget, setInviteTarget] = useState<Student | null>(null)

  const loadStudents = useCallback(async () => {
    const s = await getStudents()
    setStudents(s as any)
  }, [])

  const loadData = useCallback(async () => {
    const [s, g] = await Promise.all([getStudents(), getGroups()])
    setStudents(s as any)
    setGroups(g as any)
    setDataLoaded(true)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openAdd() { setEditStudent(null); setForm(emptyForm); setErrors({}); setShowModal(true) }
  function openEdit(s: Student) {
    setEditStudent(s)
    setForm({
      firstname: s.firstname,
      lastname: s.lastname,
      birthDate: new Date(s.birthDate).toISOString().split('T')[0],
      groupId: s.groupId || 0,
      healthInfo: s.healthInfo || '',
    })
    setErrors({}); setShowModal(true)
  }

  async function handleSubmit() {
    const e: Record<string, string> = {}
    if (!form.lastname.trim()) e.lastname = 'Овог оруулна уу'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.lastname.trim())) e.lastname = 'Зөвхөн үсэг агуулна'
    if (!form.firstname.trim()) e.firstname = 'Нэр оруулна уу'
    else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.firstname.trim())) e.firstname = 'Зөвхөн үсэг агуулна'
    if (!form.birthDate) e.birthDate = 'Огноо оруулна уу'
    else { const age = new Date().getFullYear() - new Date(form.birthDate).getFullYear(); if (age < 1 || age > 7) e.birthDate = 'Нас 1-7 байх ёстой' }
    if (!form.groupId) e.groupId = 'Бүлэг сонгоно уу'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setLoading(true)
    try {
      if (editStudent) { await updateStudent(editStudent.id, form as any); toast.success('Засагдлаа') }
      else { await createStudent(form as any); toast.success('Нэмэгдлээ') }
      setShowModal(false); setErrors({})
      await loadStudents()
    } catch (err: any) { toast.error(err.message || 'Алдаа гарлаа') }
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Архивлах уу?')) return
    await archiveStudent(id)
    toast.success('Архивлагдлаа')
    await loadStudents()
  }

  const filtered = students.filter(s =>
    `${s.firstname} ${s.lastname}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-5">
        <input type="text" placeholder="Хүүхэд хайх..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-72" />
        <button onClick={openAdd} className="bg-[#1E1B4B] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d2a6e] transition w-full sm:w-auto">
          + Хүүхэд нэмэх
        </button>
      </div>

      {!dataLoaded ? <TableSkeleton /> : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Нэр</th>
                  <th className="text-left px-5 py-3 font-medium">Төрсөн огноо</th>
                  <th className="text-left px-5 py-3 font-medium">Бүлэг</th>
                  <th className="text-left px-5 py-3 font-medium">Асран хамгаалагч</th>
                  <th className="text-left px-5 py-3 font-medium">Харшил</th>
                  <th className="text-left px-5 py-3 font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {s.lastname} {s.firstname}
                      {s.healthInfo && <span className="ml-2 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-lg">⚠</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(s.birthDate).toLocaleDateString('mn-MN')}</td>
                    <td className="px-5 py-3 text-gray-600">{s.group?.name || '—'}</td>
                    <td className="px-5 py-3">
                      {s.parent ? (
                        <span className="text-gray-600">{s.parent.user.lastname} {s.parent.user.firstname}</span>
                      ) : (
                        <button
                          onClick={() => setInviteTarget(s)}
                          className="text-xs text-purple-600 border border-purple-200 rounded-lg px-2.5 py-1 hover:bg-purple-50 transition font-medium"
                        >
                          + Эцэг эх холбох
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-[120px]">{s.healthInfo || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(s)} className="text-purple-600 hover:underline text-xs font-medium">Засах</button>
                        <button onClick={() => handleArchive(s.id)} className="text-red-400 hover:underline text-xs font-medium">Архивлах</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-300">Хүүхэд олдсонгүй</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{s.lastname} {s.firstname}</p>
                    <p className="text-xs text-gray-400">{new Date(s.birthDate).toLocaleDateString('mn-MN')}</p>
                  </div>
                  {s.healthInfo && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">⚠</span>}
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">{s.group?.name || 'Бүлэггүй'}</span>
                  {s.parent && <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">{s.parent.user.lastname} {s.parent.user.firstname}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!s.parent && (
                    <button
                      onClick={() => setInviteTarget(s)}
                      className="flex-1 text-xs text-purple-600 border border-purple-200 rounded-xl py-1.5 hover:bg-purple-50"
                    >
                      + Эцэг эх холбох
                    </button>
                  )}
                  <button onClick={() => openEdit(s)} className="flex-1 text-xs text-purple-600 border border-purple-200 rounded-xl py-1.5 hover:bg-purple-50">Засах</button>
                  <button onClick={() => handleArchive(s.id)} className="flex-1 text-xs text-red-400 border border-red-200 rounded-xl py-1.5 hover:bg-red-50">Архивлах</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-300">Хүүхэд олдсонгүй</div>}
          </div>
        </>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">{editStudent ? 'Хүүхэд засах' : 'Хүүхэд нэмэх'}</h2>
            <div className="space-y-3">
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
              <div>
                <label className="text-xs font-medium text-gray-600">Төрсөн огноо</label>
                <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.birthDate ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Бүлэг</label>
                <select value={form.groupId} onChange={e => setForm({ ...form, groupId: Number(e.target.value) })}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.groupId ? 'border-red-400' : 'border-gray-200'}`}>
                  <option value={0}>Сонгох...</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {errors.groupId && <p className="text-red-400 text-xs mt-1">{errors.groupId}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Харшил <span className="text-gray-300">(заавал биш)</span></label>
                <textarea value={form.healthInfo} onChange={e => setForm({ ...form, healthInfo: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400" rows={2} placeholder="Самрын харшилтай г.м" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Болих</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d2a6e] disabled:opacity-50">
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite parent modal */}
      {inviteTarget && (
        <InviteModal
          student={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onDone={loadStudents}
        />
      )}
    </DashboardLayout>
  )
}
