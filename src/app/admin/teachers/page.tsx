'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  archiveTeacher,
} from '@/app/actions/teacher'

type Teacher = {
  id: number
  profession: string | null
  isArchived: boolean
  user: {
    firstname: string
    lastname: string
    phone: string | null
    email: string
    username: string
  }
  group: { id: number; name: string } | null
}

const emptyForm = {
  firstname: '',
  lastname: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  profession: '',
}

export default function TeachersPage() {
  const router = useRouter()
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

  function openAdd() {
    setEditTeacher(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(t: Teacher) {
    setEditTeacher(t)
    setForm({
      firstname: t.user.firstname,
      lastname: t.user.lastname,
      phone: t.user.phone || '',
      email: t.user.email,
      username: t.user.username,
      password: '',
      profession: t.profession || '',
    })
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}

    if (!form.lastname.trim()) {
      newErrors.lastname = 'Овог оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.lastname.trim())) {
      newErrors.lastname = 'Овог зөвхөн үсэг агуулна'
    }

    if (!form.firstname.trim()) {
      newErrors.firstname = 'Нэр оруулна уу'
    } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.firstname.trim())) {
      newErrors.firstname = 'Нэр зөвхөн үсэг агуулна'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Утасны дугаар оруулна уу'
    } else if (!/^[0-9]{8}$/.test(form.phone.trim())) {
      newErrors.phone = 'Утасны дугаар 8 оронтой тоо байх ёстой'
    }

    if (!form.email.trim()) {
      newErrors.email = 'И-мэйл оруулна уу'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'И-мэйл буруу форматтай байна'
    }

    if (!form.profession.trim()) {
        newErrors.profession = 'Мэргэжил оруулна уу'
      } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.profession.trim())) {
        newErrors.profession = 'Мэргэжил зөвхөн үсэг агуулна'
      }

    if (!editTeacher) {
      if (!form.username.trim()) {
        newErrors.username = 'Нэвтрэх нэр оруулна уу'
      } else if (form.username.trim().length < 4) {
        newErrors.username = 'Нэвтрэх нэр хамгийн багадаа 4 тэмдэгт байх ёстой'
      }

      if (!form.password.trim()) {
        newErrors.password = 'Нууц үг оруулна уу'
      } else if (form.password.trim().length < 8) {
        newErrors.password = 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой'
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      if (editTeacher) {
        await updateTeacher(editTeacher.id, form)
        toast.success('Багшийн мэдээлэл амжилттай засагдлаа')
      } else {
        await createTeacher(form)
        toast.success('Багш амжилттай нэмэгдлээ')
      }
      setShowModal(false)
      setErrors({})
      await loadData()
    } catch (e: any) {
      toast.error(e.message || 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Энэ багшийг архивлах уу?')) return
    await archiveTeacher(id)
    toast.success('Багш архивлагдлаа')
    await loadData()
  }

  const filtered = teachers.filter(t =>
    `${t.user.firstname} ${t.user.lastname}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Багшийн бүртгэл</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Багш нэмэх
        </button>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="Багш хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Нэр</th>
                <th className="text-left px-4 py-3">Мэргэжил</th>
                <th className="text-left px-4 py-3">Утас</th>
                <th className="text-left px-4 py-3">И-мэйл</th>
                <th className="text-left px-4 py-3">Бүлэг</th>
                <th className="text-left px-4 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {t.user.lastname} {t.user.firstname}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.profession || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.user.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.user.email}</td>
                  <td className="px-4 py-3">{t.group?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-blue-600 hover:underline text-xs">
                        Засах
                      </button>
                      <button onClick={() => handleArchive(t.id)} className="text-red-500 hover:underline text-xs">
                        Архивлах
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Багш олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              {editTeacher ? 'Багш засах' : 'Багш нэмэх'}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Овог</label>
                  <input
                    type="text"
                    value={form.lastname}
                    onChange={e => setForm({ ...form, lastname: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.lastname ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Нэр</label>
                  <input
                    type="text"
                    value={form.firstname}
                    onChange={e => setForm({ ...form, firstname: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.firstname ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Мэргэжил</label>
                <input
                  type="text"
                  value={form.profession}
                  onChange={e => setForm({ ...form, profession: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.profession ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Сургагч багш"
                />
                {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Утас</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="99001122"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">И-мэйл</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="teacher@sob.mn"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {!editTeacher && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Нэвтрэх нэр</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Нууц үг</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Болих
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}