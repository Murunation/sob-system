'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from './parent-nav'
import { getParentDashboardStats } from '@/app/actions/parent'

// ── Types ──────────────────────────────────────────────────────────────────

type ParentStats = Awaited<ReturnType<typeof getParentDashboardStats>>
type Child = NonNullable<ParentStats>['children'][number]

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-2xl animate-pulse ${className}`} />
}

// ── Attendance Ring ────────────────────────────────────────────────────────

function AttendanceRing({ rate, present, total }: { rate: number; present: number; total: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (rate / 100) * circ
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#f0eeff" strokeWidth="8" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke="url(#ringGradP)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
          <defs>
            <linearGradient id="ringGradP" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6B4EFF" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{rate}<span className="text-sm">%</span></span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        <span className="font-semibold text-gray-700">{present}</span>/{total} өдөр
      </p>
    </div>
  )
}

// ── 7-day dots chart ───────────────────────────────────────────────────────

function WeekDots({ chartData }: { chartData: Child['chartData'] }) {
  const statusStyle: Record<string, { dot: string; label: string }> = {
    PRESENT: { dot: 'bg-green-500', label: 'И' },
    ABSENT:  { dot: 'bg-red-400',   label: 'Т' },
    SICK:    { dot: 'bg-yellow-400', label: 'Ө' },
    EXCUSED: { dot: 'bg-blue-400',  label: 'Ч' },
  }
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-end gap-1.5 w-full">
      {chartData.map((d, i) => {
        const s = d.status ? statusStyle[d.status] : null
        const isToday = d.date === today
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-6 rounded-lg flex items-center justify-center transition-all
                ${s ? s.dot : 'bg-gray-100'}
                ${isToday ? 'ring-2 ring-[#6B4EFF] ring-offset-1' : ''}`}
            >
              {s && <span className="text-white text-xs font-bold leading-none">{s.label}</span>}
            </div>
            <span className={`text-xs leading-none ${isToday ? 'font-bold text-[#6B4EFF]' : 'text-gray-300'}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Today Badge ────────────────────────────────────────────────────────────

function TodayBadge({ status }: { status: string | null }) {
  if (!status) return (
    <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-medium">Тэмдэглэгдээгүй</span>
  )
  const map: Record<string, { label: string; className: string }> = {
    PRESENT: { label: 'Ирсэн',     className: 'bg-green-100 text-green-700' },
    ABSENT:  { label: 'Тасалсан',  className: 'bg-red-100 text-red-600' },
    SICK:    { label: 'Өвдсөн',    className: 'bg-yellow-100 text-yellow-700' },
    EXCUSED: { label: 'Чөлөөтэй', className: 'bg-blue-100 text-blue-600' },
  }
  const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.className}`}>{s.label}</span>
}

// ── Child Card ─────────────────────────────────────────────────────────────

function ChildCard({ child, router }: { child: Child; router: ReturnType<typeof useRouter> }) {
  const initials = `${child.lastname[0] ?? ''}${child.firstname[0] ?? ''}`.toUpperCase()

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      {/* Top: avatar + name + today status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B4EFF] to-[#a78bfa] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {child.lastname} {child.firstname}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{child.age} настай</p>
            </div>
            <TodayBadge status={child.todayStatus} />
          </div>
          {child.group && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs bg-[#f0eeff] text-[#6B4EFF] px-2 py-0.5 rounded-full font-medium">
                {child.group.name}
              </span>
              {child.group.teacherName && (
                <span className="text-xs text-gray-400">
                  Багш: {child.group.teacherName}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle: ring + 7-day dots */}
      <div className="flex items-center gap-5 mb-4">
        <AttendanceRing
          rate={child.attendanceRate}
          present={child.presentDays}
          total={child.totalDays}
        />
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-2">Сүүлийн 7 хоног</p>
          <WeekDots chartData={child.chartData} />
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {[
              { dot: 'bg-green-500', label: 'Ирсэн' },
              { dot: 'bg-red-400',   label: 'Тасалсан' },
              { dot: 'bg-yellow-400', label: 'Өвдсөн' },
              { dot: 'bg-blue-400',  label: 'Чөлөөтэй' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                <span className="text-xs text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: quick links */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
        <button
          onClick={() => router.push('/parent/attendance')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f0eeff] group transition text-left"
        >
          <div className="w-6 h-6 bg-[#f0eeff] group-hover:bg-[#6B4EFF] rounded-lg flex items-center justify-center transition-colors shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" className="group-hover:stroke-white transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-[#6B4EFF] transition-colors">Ирцийн дэлгэрэнгүй</span>
        </button>
        <button
          onClick={() => router.push('/parent/reviews')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f0eeff] group transition text-left"
        >
          <div className="w-6 h-6 bg-[#f0eeff] group-hover:bg-[#6B4EFF] rounded-lg flex items-center justify-center transition-colors shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" className="group-hover:stroke-white transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-[#6B4EFF] transition-colors">Үнэлгээ харах</span>
        </button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ParentStats>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    getParentDashboardStats().then(setStats)
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

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">

      {/* ── Header ── */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">
          Сайн байна уу{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      {/* ── Children cards ── */}
      {!stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : stats.children.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-[#f0eeff] rounded-2xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B4EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <p className="text-gray-500 text-sm">Хүүхэд бүртгэгдээгүй байна</p>
          <p className="text-gray-400 text-xs text-center">Багш танаас урилга илгээх болно</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {stats.children.map(child => (
            <ChildCard key={child.id} child={child} router={router} />
          ))}
        </div>
      )}

      {/* ── Quick links ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {parentNavItems.slice(1).map(item => (
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
