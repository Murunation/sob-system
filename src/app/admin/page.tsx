'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getDashboardStats } from '@/app/actions/stats'

type Stats = {
  studentCount: number
  teacherCount: number
  groupCount: number
  todayAttendance: number
}

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
]

export default function AdminDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ studentCount: 0, teacherCount: 0, groupCount: 0, todayAttendance: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    getDashboardStats().then(s => setStats(s as Stats))
  }, [])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-gray-400">
      Уншиж байна...
    </div>
  )

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.studentCount}</p>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Нийт хүүхэд</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.todayAttendance}</p>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Өнөөдрийн ирц</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.teacherCount}</p>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Нийт багш</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.groupCount}</p>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Бүлэг</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {navItems.slice(1).map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm hover:shadow-md transition text-left group"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#F0EEFF] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#1E1B4B] transition-colors">
              <span className="text-[#6B4EFF] group-hover:text-white transition-colors">
                {item.icon}
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-xs lg:text-sm">{item.label}</p>
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}