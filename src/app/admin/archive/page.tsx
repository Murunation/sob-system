'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/ui/DashboardLayout'
import {
  getArchivedStudents,
  getArchivedTeachers,
  getArchivedChefs,
  restoreStudentFromArchive,
  restoreTeacherFromArchive,
  restoreChefFromArchive,
} from '@/app/actions/chef'

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

type Tab = 'students' | 'teachers' | 'chefs'

type ArchivedStudent = {
  id: number; firstname: string; lastname: string; birthDate: Date
  group: { id: number; name: string } | null
  parent: { user: { firstname: string; lastname: string } } | null
}
type ArchivedTeacher = {
  id: number; profession: string | null
  user: { firstname: string; lastname: string; email: string; phone: string | null }
  group: { name: string } | null
}
type ArchivedChef = {
  id: number
  user: { firstname: string; lastname: string; email: string; phone: string | null }
}

export default function ArchivePage() {
  const [tab, setTab] = useState<Tab>('students')
  const [students, setStudents] = useState<ArchivedStudent[]>([])
  const [teachers, setTeachers] = useState<ArchivedTeacher[]>([])
  const [chefs, setChefs] = useState<ArchivedChef[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<number | null>(null)

  async function loadAll() {
    setLoading(true)
    const [s, t, c] = await Promise.all([
      getArchivedStudents(),
      getArchivedTeachers(),
      getArchivedChefs(),
    ])
    setStudents(s as any)
    setTeachers(t as any)
    setChefs(c as any)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function handleRestoreStudent(id: number) {
    setRestoring(id)
    await restoreStudentFromArchive(id)
    toast.success('Сэргээгдлээ')
    await loadAll()
    setRestoring(null)
  }

  async function handleRestoreTeacher(id: number) {
    setRestoring(id)
    await restoreTeacherFromArchive(id)
    toast.success('Сэргээгдлээ')
    await loadAll()
    setRestoring(null)
  }

  async function handleRestoreChef(id: number) {
    setRestoring(id)
    await restoreChefFromArchive(id)
    toast.success('Сэргээгдлээ')
    await loadAll()
    setRestoring(null)
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'students', label: 'Хүүхэд', count: students.length },
    { key: 'teachers', label: 'Багш', count: teachers.length },
    { key: 'chefs', label: 'Тогооч', count: chefs.length },
  ]

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800">Архив</h1>
        <p className="text-sm text-gray-400 mt-0.5">Архивлагдсан бүртгэлүүд</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
              tab === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Students tab */}
          {tab === 'students' && (
            <div>
              {students.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
                  Архивлагдсан хүүхэд байхгүй
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/60 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Нэр</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Бүлэг</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Эцэг эх</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-700">{s.lastname} {s.firstname}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.group?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {s.parent ? `${s.parent.user.lastname} ${s.parent.user.firstname}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRestoreStudent(s.id)}
                              disabled={restoring === s.id}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              {restoring === s.id ? '...' : 'Сэргээх'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Teachers tab */}
          {tab === 'teachers' && (
            <div>
              {teachers.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
                  Архивлагдсан багш байхгүй
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/60 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Нэр</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Мэргэжил</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Бүлэг</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-700">{t.user.lastname} {t.user.firstname}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{t.profession ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{t.group?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRestoreTeacher(t.id)}
                              disabled={restoring === t.id}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              {restoring === t.id ? '...' : 'Сэргээх'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Chefs tab */}
          {tab === 'chefs' && (
            <div>
              {chefs.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
                  Архивлагдсан тогооч байхгүй
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/60 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Нэр</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Утас</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">И-мэйл</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {chefs.map(c => (
                        <tr key={c.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-700">{c.user.lastname} {c.user.firstname}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.user.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.user.email}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRestoreChef(c.id)}
                              disabled={restoring === c.id}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              {restoring === c.id ? '...' : 'Сэргээх'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
