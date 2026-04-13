'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getStudents,
  createStudent,
  updateStudent,
  archiveStudent,
} from '@/app/actions/student'
import { getGroups } from '@/app/actions/group'
import { getParents } from '@/app/actions/parent'

type Student = {
  id: number
  firstname: string
  lastname: string
  birthDate: string
  groupId: number | null
  parentId: number | null
  healthInfo: string | null
  status: string
  group: { id: number; name: string } | null
  parent: { id: number; user: { firstname: string; lastname: string } } | null
}

type Group = { id: number; name: string }
type Parent = { id: number; user: { firstname: string; lastname: string } }

const emptyForm = {
  firstname: '',
  lastname: '',
  birthDate: '',
  groupId: 0,
  parentId: 0,
  healthInfo: '',
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  async function loadData() {
    const [s, g, p] = await Promise.all([getStudents(), getGroups(), getParents()])
    setStudents(s as any)
    setGroups(g as any)
    setParents(p as any)
  }

  useEffect(() => { loadData() }, [])

  function openAdd() {
    setEditStudent(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(s: Student) {
    setEditStudent(s)
    setForm({
      firstname: s.firstname,
      lastname: s.lastname,
      birthDate: new Date(s.birthDate).toISOString().split('T')[0],
      groupId: s.groupId || 0,
      parentId: s.parentId || 0,
      healthInfo: s.healthInfo || '',
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

    if (!form.birthDate) {
      newErrors.birthDate = 'Төрсөн огноо оруулна уу'
    } else {
      const age = new Date().getFullYear() - new Date(form.birthDate).getFullYear()
      if (age < 1 || age > 7) newErrors.birthDate = 'Нас 1-7 байх ёстой'
    }

    if (!form.groupId) newErrors.groupId = 'Бүлэг сонгоно уу'
    if (!form.parentId) newErrors.parentId = 'Асран хамгаалагч сонгоно уу'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    if (editStudent) {
      await updateStudent(editStudent.id, form as any)
      toast.success('Хүүхдийн мэдээлэл амжилттай засагдлаа')
    } else {
      await createStudent(form as any)
      toast.success('Хүүхэд амжилттай нэмэгдлээ')
    }
    setShowModal(false)
    setErrors({})
    await loadData()
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Энэ хүүхдийг архивлах уу?')) return
    await archiveStudent(id)
    toast.success('Хүүхэд архивлагдлаа')
    await loadData()
  }

  const filtered = students.filter(s =>
    `${s.firstname} ${s.lastname}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Хүүхдийн бүртгэл</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Хүүхэд нэмэх
        </button>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="Хүүхэд хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Нэр</th>
                <th className="text-left px-4 py-3">Төрсөн огноо</th>
                <th className="text-left px-4 py-3">Бүлэг</th>
                <th className="text-left px-4 py-3">Асран хамгаалагч</th>
                <th className="text-left px-4 py-3">Харшил</th>
                <th className="text-left px-4 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {s.lastname} {s.firstname}
                    {s.healthInfo && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">⚠️ харшил</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(s.birthDate).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-4 py-3">{s.group?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {s.parent ? `${s.parent.user.lastname} ${s.parent.user.firstname}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.healthInfo || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">
                        Засах
                      </button>
                      <button onClick={() => handleArchive(s.id)} className="text-red-500 hover:underline text-xs">
                        Архивлах
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Хүүхэд олдсонгүй
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
              {editStudent ? 'Хүүхэд засах' : 'Хүүхэд нэмэх'}
            </h2>

            <div className="space-y-3">
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

              <div>
                <label className="text-sm font-medium text-gray-700">Төрсөн огноо</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Бүлэг</label>
                <select
                  value={form.groupId}
                  onChange={e => setForm({ ...form, groupId: Number(e.target.value) })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.groupId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={0}>Сонгох...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {errors.groupId && <p className="text-red-500 text-xs mt-1">{errors.groupId}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Асран хамгаалагч</label>
                <select
                  value={form.parentId}
                  onChange={e => setForm({ ...form, parentId: Number(e.target.value) })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.parentId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={0}>Сонгох...</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.user.lastname} {p.user.firstname}
                    </option>
                  ))}
                </select>
                {errors.parentId && <p className="text-red-500 text-xs mt-1">{errors.parentId}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Харшил / онцлог мэдээлэл
                  <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
                </label>
                <textarea
                  value={form.healthInfo}
                  onChange={e => setForm({ ...form, healthInfo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  rows={2}
                  placeholder="Самрын харшилтай г.м"
                />
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