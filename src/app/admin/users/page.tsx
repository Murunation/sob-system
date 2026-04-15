'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getAllUsers, updateUserCreds, toggleUserActive, deleteUser } from '@/app/actions/user'

type User = {
  id: number
  firstname: string
  lastname: string
  role: string
  username: string
  email: string
  phone: string | null
  isArchived: boolean
  createdAt: Date
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Эрхлэгч',
  TEACHER: 'Багш',
  CHEF: 'Тогооч',
  PARENT: 'Эцэг эх',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  TEACHER: 'bg-blue-100 text-blue-700',
  CHEF: 'bg-orange-100 text-orange-700',
  PARENT: 'bg-green-100 text-green-700',
}

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/parents', label: 'Эцэг эхийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/chefs', label: 'Тогоочийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/payments', label: 'Төлбөр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="17" cy="15" r="3"/><path d="M19.5 17.5 22 20"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/archive', label: 'Архив', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
]

export default function UsersPage() {
  const { data: session } = useSession()
  const myId = Number((session?.user as any)?.id)

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Action loading
  const [acting, setActing] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getAllUsers()
    setUsers(data as any)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(u: User) {
    setEditUser(u)
    setForm({ username: u.username, password: '' })
    setErrors({})
    setShowPassword(false)
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.username.trim()) e.username = 'Нэвтрэх нэр оруулна уу'
    else if (form.username.trim().length < 4) e.username = 'Хамгийн багадаа 4 тэмдэгт'
    if (form.password && form.password.length < 8) e.password = 'Хамгийн багадаа 8 тэмдэгт'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSaving(true)
    try {
      await updateUserCreds(editUser!.id, {
        username: form.username.trim(),
        password: form.password || undefined,
      })
      toast.success('Засагдлаа')
      setEditUser(null)
      await load()
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа')
    }
    setSaving(false)
  }

  async function handleToggle(u: User) {
    const action = u.isArchived ? 'идэвхжүүлэх' : 'идэвхгүй болгох'
    if (!confirm(`${u.lastname} ${u.firstname}-г ${action} уу?`)) return
    setActing(u.id)
    try {
      await toggleUserActive(u.id, u.isArchived)
      toast.success(u.isArchived ? 'Идэвхжүүллээ' : 'Идэвхгүй болголоо')
      await load()
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа')
    }
    setActing(null)
  }

  async function handleDelete(u: User) {
    if (!confirm(`${u.lastname} ${u.firstname}-г бүрмөсөн устгах уу?\nЭнэ үйлдлийг буцаах боломжгүй.`)) return
    setActing(u.id)
    try {
      await deleteUser(u.id)
      toast.success('Устгагдлаа')
      await load()
    } catch (err: any) {
      toast.error(err.message || 'Устгах боломжгүй — холбоотой мэдээлэл байна')
    }
    setActing(null)
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchSearch = !q || `${u.firstname} ${u.lastname} ${u.username}`.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const roleCounts = { ALL: users.length, ADMIN: 0, TEACHER: 0, CHEF: 0, PARENT: 0 }
  users.forEach(u => { if (u.role in roleCounts) (roleCounts as any)[u.role]++ })

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Хэрэглэгчийн бүртгэл</h1>
          <p className="text-sm text-gray-400 mt-0.5">Нийт {users.length} хэрэглэгч</p>
        </div>
        <input
          type="text"
          placeholder="Нэр, нэвтрэх нэрээр хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-72"
        />
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 flex-wrap">
        {(['ALL', 'ADMIN', 'TEACHER', 'CHEF', 'PARENT'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              roleFilter === r ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {r === 'ALL' ? 'Бүгд' : ROLE_LABELS[r]}
            <span className={`text-xs px-1.5 rounded-full ${
              roleFilter === r ? 'bg-gray-100 text-gray-600' : 'bg-transparent text-gray-400'
            }`}>
              {(roleCounts as any)[r]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-14 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/60 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Нэр</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Үүрэг</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Нэвтрэх нэр</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Утас / И-мэйл</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Статус</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={`border-b border-gray-50 last:border-0 transition ${u.isArchived ? 'opacity-50' : 'hover:bg-gray-50/40'}`}>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {u.lastname} {u.firstname}
                      {u.id === myId && <span className="ml-2 text-xs text-purple-400">(би)</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-700 text-xs">{u.username}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {u.phone && <div>{u.phone}</div>}
                      <div className="text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        u.isArchived ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.isArchived ? 'Идэвхгүй' : 'Идэвхтэй'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs text-purple-600 hover:underline font-medium"
                        >
                          Засах
                        </button>
                        {u.id !== myId && (
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={acting === u.id}
                            className={`text-xs font-medium hover:underline ${u.isArchived ? 'text-green-600' : 'text-amber-500'}`}
                          >
                            {acting === u.id ? '...' : u.isArchived ? 'Идэвхжүүлэх' : 'Идэвхгүй'}
                          </button>
                        )}
                        {u.id !== myId && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={acting === u.id}
                            className="text-xs text-red-400 hover:underline font-medium"
                          >
                            Устгах
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-300">Хэрэглэгч олдсонгүй</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {filtered.map(u => (
              <div key={u.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${u.isArchived ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {u.lastname} {u.firstname}
                      {u.id === myId && <span className="ml-1 text-xs text-purple-400">(би)</span>}
                    </p>
                    <p className="font-mono text-xs text-gray-500 mt-0.5">{u.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isArchived ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
                      {u.isArchived ? 'Идэвхгүй' : 'Идэвхтэй'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{u.phone ?? ''} {u.email}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openEdit(u)} className="text-xs text-purple-600 border border-purple-200 rounded-xl px-3 py-1.5 hover:bg-purple-50">Засах</button>
                  {u.id !== myId && (
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={acting === u.id}
                      className={`text-xs border rounded-xl px-3 py-1.5 ${u.isArchived ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-amber-500 border-amber-200 hover:bg-amber-50'}`}
                    >
                      {acting === u.id ? '...' : u.isArchived ? 'Идэвхжүүлэх' : 'Идэвхгүй'}
                    </button>
                  )}
                  {u.id !== myId && (
                    <button onClick={() => handleDelete(u)} disabled={acting === u.id} className="text-xs text-red-400 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50">Устгах</button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Хэрэглэгч олдсонгүй</div>
            )}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm shadow-2xl">
            <h2 className="text-base font-bold text-gray-800 mb-1">Нэвтрэх мэдээлэл засах</h2>
            <p className="text-xs text-gray-400 mb-4">{editUser.lastname} {editUser.firstname} · {ROLE_LABELS[editUser.role]}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Нэвтрэх нэр</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm mt-1 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.username ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Нууц үг <span className="text-gray-400 font-normal">(хоосон орхивол өөрчлөгдөхгүй)</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] disabled:opacity-50"
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
