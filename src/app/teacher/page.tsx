'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from './teacher-nav'
import { getTeacherDashboardStats } from '@/app/actions/teacher-dashboard'

// ── Types ──────────────────────────────────────────────────────────────────

type TeacherStats = Awaited<ReturnType<typeof getTeacherDashboardStats>>

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-2xl animate-pulse ${className}`} />
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-[#6B4EFF] to-[#a78bfa] flex items-center justify-center shrink-0`}>
      <span className="text-white font-bold">{initials}</span>
    </div>
  )
}

// ── Attendance Ring ────────────────────────────────────────────────────────

function AttendanceRing({ rate, present, total }: { rate: number; present: number; total: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (rate / 100) * circ
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f0eeff" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke="url(#ringGradT)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <defs>
            <linearGradient id="ringGradT" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6B4EFF" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{rate}<span className="text-lg">%</span></span>
          <span className="text-xs text-gray-400 mt-0.5">Ирц</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        <span className="font-semibold text-gray-800">{present}</span>
        <span className="text-gray-300 mx-1">/</span>
        {total} хүүхэд
      </p>
    </div>
  )
}

// ── Bar Chart ──────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const today = new Date().toISOString().split('T')[0]
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100
        const isToday = d.date === today
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <span className={`text-xs font-semibold transition-opacity ${d.count > 0 ? 'opacity-60' : 'opacity-0'} group-hover:opacity-100`}>
              {d.count}
            </span>
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-[#6B4EFF]' : 'bg-[#c4b5fd]'}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <span className={`text-xs ${isToday ? 'font-bold text-[#6B4EFF]' : 'text-gray-400'}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-gray-300 px-2 py-0.5 rounded-full bg-gray-50">—</span>
  const map: Record<string, { label: string; className: string }> = {
    PRESENT:  { label: 'Ирсэн',     className: 'bg-green-100 text-green-700' },
    ABSENT:   { label: 'Тасалсан',  className: 'bg-red-100 text-red-600' },
    SICK:     { label: 'Өвдсөн',    className: 'bg-yellow-100 text-yellow-700' },
    EXCUSED:  { label: 'Чөлөөтэй', className: 'bg-blue-100 text-blue-600' },
  }
  const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>{s.label}</span>
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<TeacherStats>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    getTeacherDashboardStats().then(setStats)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const today = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  const teacherName = stats?.teacher
    ? `${stats.teacher.lastname} ${stats.teacher.firstname}`
    : session?.user?.name ?? ''

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">

      {/* ── Header ── */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">
          Сайн байна уу{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      {/* ── Profile + Group ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Миний мэдээлэл</p>
          {!stats ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar name={teacherName} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">{teacherName}</p>
                <p className="text-sm text-[#6B4EFF] font-medium mt-0.5">{stats.teacher.profession || 'Багш'}</p>
                <div className="mt-2 space-y-1">
                  {stats.teacher.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {stats.teacher.phone}
                    </div>
                  )}
                  {stats.teacher.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span className="truncate">{stats.teacher.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Group info card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Миний анги</p>
          {!stats ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !stats.group ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-sm text-gray-400">Анги олдсонгүй</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.group.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stats.group.ageRange}</p>
                </div>
                <div className="bg-[#f0eeff] px-3 py-1.5 rounded-xl">
                  <p className="text-xs text-[#6B4EFF] font-semibold">{stats.stats.totalStudents} хүүхэд</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Нийт', value: stats.stats.totalStudents, color: 'text-gray-800', bg: 'bg-gray-50' },
                  { label: 'Ирц', value: stats.stats.presentToday, color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Тасалсан', value: stats.stats.absentToday + stats.stats.sickToday, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance ring + Bar chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">

        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
          {!stats ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Skeleton className="w-36 h-36 rounded-full" />
              <Skeleton className="w-24 h-4" />
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Өнөөдрийн ирц</p>
              <AttendanceRing
                rate={stats.stats.attendanceRate}
                present={stats.stats.presentToday}
                total={stats.stats.totalStudents}
              />
              {stats.stats.notMarked > 0 && (
                <p className="text-xs text-orange-500 mt-2 font-medium">
                  {stats.stats.notMarked} хүүхдийн ирц бүртгэгдээгүй
                </p>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">7 хоногийн ирцийн хандлага</p>
          {!stats ? (
            <Skeleton className="h-28 w-full" />
          ) : stats.weeklyAttendance.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-10">Анги байхгүй</p>
          ) : (
            <BarChart data={stats.weeklyAttendance} />
          )}
        </div>
      </div>

      {/* ── Students list ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ангийн хүүхдүүд</p>
          {stats?.stats.totalStudents && stats.stats.totalStudents > 0 && (
            <button
              onClick={() => router.push('/teacher/students')}
              className="text-xs text-[#6B4EFF] font-medium hover:underline"
            >
              Бүгдийг харах →
            </button>
          )}
        </div>
        {!stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : stats.students.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-8">Хүүхэд байхгүй байна</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {stats.students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#f0eeff] flex items-center justify-center shrink-0">
                    <span className="text-[#6B4EFF] text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {s.lastname} {s.firstname}
                  </span>
                </div>
                <StatusBadge status={s.todayStatus} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick links ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {teacherNavItems.slice(1, 5).map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f0eeff] group transition text-left"
            >
              <div className="w-7 h-7 bg-[#f0eeff] group-hover:bg-[#1E1B4B] rounded-lg flex items-center justify-center transition-colors shrink-0">
                <span className="text-[#6B4EFF] group-hover:text-white transition-colors">{item.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-700 leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </DashboardLayout>
  )
}
