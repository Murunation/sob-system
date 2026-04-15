'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { getDashboardStats } from '@/app/actions/stats'

// ── Types ──────────────────────────────────────────────────────────────────

type WeekDay = { label: string; date: string; count: number }
type GroupRow = { name: string; total: number; present: number }
type Stats = {
  studentCount: number
  teacherCount: number
  groupCount: number
  parentCount: number
  todayAttendance: number
  todayAttendanceRate: number
  weeklyAttendance: WeekDay[]
  groupAttendance: GroupRow[]
  insights: { noParent: number; noGroup: number; pendingFeedback: number }
}

// ── Nav ────────────────────────────────────────────────────────────────────

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/parents', label: 'Эцэг эхийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/chefs', label: 'Тогоочийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { href: '/admin/payments', label: 'Төлбөр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
  { href: '/admin/archive', label: 'Архив', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
]

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-2xl animate-pulse ${className}`} />
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
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f0eeff" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke="url(#ringGrad)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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

function BarChart({ data }: { data: WeekDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => {
        const pct = (d.count / Math.max(max, 1)) * 100
        const isToday = d.date === today
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            {/* Count tooltip */}
            <span className={`text-xs font-semibold transition-opacity ${d.count > 0 ? 'opacity-60' : 'opacity-0'} group-hover:opacity-100`}>
              {d.count}
            </span>
            {/* Bar */}
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-[#6B4EFF]' : 'bg-[#c4b5fd]'}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            {/* Label */}
            <span className={`text-xs ${isToday ? 'font-bold text-[#6B4EFF]' : 'text-gray-400'}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Group Progress Bar ─────────────────────────────────────────────────────

function GroupBar({ name, present, total }: GroupRow) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0
  const color = pct >= 85 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{present}/{total}</span>
          <span className={`text-xs font-semibold w-10 text-right ${pct >= 85 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Insight Card ───────────────────────────────────────────────────────────

function InsightCard({
  label,
  value,
  href,
  type,
  router,
}: {
  label: string
  value: number
  href: string
  type: 'warn' | 'info' | 'danger'
  router: ReturnType<typeof useRouter>
}) {
  if (value === 0) return null

  const colors = {
    warn: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', dot: 'bg-orange-400' },
    info: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', dot: 'bg-blue-400' },
    danger: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', dot: 'bg-red-400' },
  }[type]

  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${colors.bg} ${colors.border} hover:opacity-80 transition text-left`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${colors.text}`}>{value}</span>
    </button>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    getDashboardStats().then((s) => setStats(s as Stats))
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

  const hasInsights = stats && (
    stats.insights.noParent > 0 ||
    stats.insights.noGroup > 0 ||
    stats.insights.pendingFeedback > 0
  )

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">

      {/* ── Header ── */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">
          Сайн байна уу{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      {/* ── Hero row: Ring + Bar chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">

        {/* Attendance ring */}
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
                rate={stats.todayAttendanceRate}
                present={stats.todayAttendance}
                total={stats.studentCount}
              />
            </>
          )}
        </div>

        {/* 7-day bar chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">7 хоногийн ирцийн хандлага</p>
          {!stats ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <BarChart data={stats.weeklyAttendance} />
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {[
          { label: 'Нийт хүүхэд', key: 'studentCount', color: 'bg-violet-100', stroke: '#6B4EFF',
            icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="9" cy="7" r="4"/> },
          { label: 'Нийт багш', key: 'teacherCount', color: 'bg-blue-100', stroke: '#2563EB',
            icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="12" cy="7" r="4"/> },
          { label: 'Бүлэг', key: 'groupCount', color: 'bg-orange-100', stroke: '#EA580C',
            icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, icon2: <polyline points="9 22 9 12 15 12 15 22"/> },
          { label: 'Эцэг эх', key: 'parentCount', color: 'bg-green-100', stroke: '#16A34A',
            icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, icon2: <><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
        ].map(({ label, key, color, stroke, icon, icon2 }) => (
          <div key={key} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon}{icon2}
              </svg>
            </div>
            {!stats ? (
              <Skeleton className="h-8 w-12 mb-2" />
            ) : (
              <p className="text-2xl lg:text-3xl font-bold text-gray-800">{(stats as any)[key]}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom row: Group attendance + Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Group attendance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Бүлгийн өнөөдрийн ирц</p>
          {!stats ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : stats.groupAttendance.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-6">Бүлэг байхгүй байна</p>
          ) : (
            <div className="space-y-4">
              {stats.groupAttendance.map((g) => (
                <GroupBar key={g.name} {...g} />
              ))}
            </div>
          )}
        </div>

        {/* Insights + Quick actions */}
        <div className="space-y-3">

          {/* Action insights */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Анхааруулга</p>
            {!stats ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !hasInsights ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Бүх зүйл эмхэлцэтэй байна</p>
              </div>
            ) : (
              <div className="space-y-2">
                <InsightCard
                  label="Эцэг эхгүй хүүхэд"
                  value={stats.insights.noParent}
                  href="/admin/students"
                  type="warn"
                  router={router}
                />
                <InsightCard
                  label="Бүлэггүй хүүхэд"
                  value={stats.insights.noGroup}
                  href="/admin/students"
                  type="danger"
                  router={router}
                />
                <InsightCard
                  label="Хариугүй санал хүсэлт"
                  value={stats.insights.pendingFeedback}
                  href="/admin/feedback"
                  type="info"
                  router={router}
                />
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</p>
            <div className="grid grid-cols-2 gap-2">
              {navItems.slice(1, 5).map((item) => (
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
        </div>
      </div>

    </DashboardLayout>
  )
}
