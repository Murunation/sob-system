'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getGroups,
  createGroup,
  updateGroup,
  archiveGroup,
} from '@/app/actions/group'
import { getTeachers } from '@/app/actions/teacher'

type Group = {
  id: number
  name: string
  ageRange: string
  capacity: number
  isArchived: boolean
  teacher: {
    id: number
    user: { firstname: string; lastname: string }
  } | null
}

type Teacher = {
  id: number
  user: { firstname: string; lastname: string }
}

const emptyForm = {
  name: '',
  ageRange: '',
  capacity: 25,
  teacherId: 0,
}

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const [g, t] = await Promise.all([getGroups(), getTeachers()])
    setGroups(g as any)
    setTeachers(t as any)
  }

  useEffect(() => { loadData() }, [])

  function openAdd() {
    setEditGroup(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(g: Group) {
    setEditGroup(g)
    setForm({
      name: g.name,
      ageRange: g.ageRange,
      capacity: g.capacity,
      teacherId: g.teacher?.id || 0,
    })
    setErrors({})
    setShowModal(true)
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
        newErrors.name = 'Бүлгийн нэр оруулна уу'
      } else if (form.name.trim().length < 2) {
        newErrors.name = 'Бүлгийн нэр хэт богино байна'
      } else if (!/^[А-ЯӨҮа-яөүA-Za-z\s]+$/.test(form.name.trim())) {
        newErrors.name = 'Бүлгийн нэр зөвхөн үсэг агуулна'
      }

    if (!form.ageRange.trim()) {
      newErrors.ageRange = 'Насны ангилал оруулна уу'
    }

    if (!form.capacity || form.capacity < 1) {
      newErrors.capacity = 'Хүүхдийн тоо оруулна уу'
    } else if (form.capacity > 50) {
      newErrors.capacity = 'Хүүхдийн тоо 50-аас хэтрэхгүй байх ёстой'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    const data = {
      name: form.name,
      ageRange: form.ageRange,
      capacity: form.capacity,
      teacherId: form.teacherId || undefined,
    }
    if (editGroup) {
      await updateGroup(editGroup.id, data)
      toast.success('Бүлгийн мэдээлэл амжилттай засагдлаа')
    } else {
      await createGroup(data)
      toast.success('Бүлэг амжилттай нэмэгдлээ')
    }
    setShowModal(false)
    setErrors({})
    await loadData()
    setLoading(false)
  }

  async function handleArchive(id: number) {
    if (!confirm('Энэ бүлгийг архивлах уу?')) return
    await archiveGroup(id)
    toast.success('Бүлэг архивлагдлаа')
    await loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
            ← Буцах
          </button>
          <h1 className="text-xl font-bold text-gray-800">Бүлгийн удирдлага</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Бүлэг нэмэх
        </button>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{g.name}</h3>
                  <p className="text-sm text-gray-500">{g.ageRange}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {g.capacity} хүүхэд
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Багш: </span>
                {g.teacher
                  ? `${g.teacher.user.lastname} ${g.teacher.user.firstname}`
                  : 'Хуваарилагдаагүй'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(g)}
                  className="flex-1 text-sm text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50"
                >
                  Засах
                </button>
                <button
                  onClick={() => handleArchive(g.id)}
                  className="flex-1 text-sm text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50"
                >
                  Архивлах
                </button>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-12">
              Бүлэг олдсонгүй
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              {editGroup ? 'Бүлэг засах' : 'Бүлэг нэмэх'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Бүлгийн нэр</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Наран бүлэг"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Насны ангилал</label>
                <input
                  type="text"
                  value={form.ageRange}
                  onChange={e => setForm({ ...form, ageRange: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.ageRange ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="3-4 нас"
                />
                {errors.ageRange && <p className="text-red-500 text-xs mt-1">{errors.ageRange}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Хүүхдийн дээд тоо</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Багш
                  <span className="text-gray-400 font-normal ml-1">(заавал биш)</span>
                </label>
                <select
                  value={form.teacherId}
                  onChange={e => setForm({ ...form, teacherId: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  <option value={0}>Сонгох...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user.lastname} {t.user.firstname}
                    </option>
                  ))}
                </select>
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