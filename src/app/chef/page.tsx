'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { chefNavItems } from './chef-nav'
import { getChefDashboardStats } from '@/app/actions/chef-dashboard'

// ── Types ──────────────────────────────────────────────────────────────────

type ChefStats = Awaited<ReturnType<typeof getChefDashboardStats>>

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-2xl animate-pulse ${className}`} />
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-2xl">{initials}</span>
    </div>
  )
}

// ── Meal Status Badge ──────────────────────────────────────────────────────

function MealStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PLANNED:   { label: 'Төлөвлөсөн',    className: 'bg-blue-100 text-blue-600' },
    CONFIRMED: { label: 'Баталгаажсан',  className: 'bg-green-100 text-green-700' },
    CLOSED:    { label: 'Хаагдсан',      className: 'bg-gray-100 text-gray-500' },
  }
  const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>{s.label}</span>
}

// ── Week Day Row ───────────────────────────────────────────────────────────

function WeekDayRow({ date, menu, status }: { date: Date; menu: string; status: string }) {
  const dayLabel = new Date(date).toLocaleDateString('mn-MN', { weekday: 'short', month: 'short', day: 'numeric' })
  const isToday = new Date(date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isToday ? 'bg-[#f0eeff]' : 'hover:bg-gray-50'} transition`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${isToday ? 'bg-[#6B4EFF]' : 'bg-gray-200'}`} />
      <span className={`text-xs font-medium w-24 shrink-0 ${isToday ? 'text-[#6B4EFF] font-bold' : 'text-gray-400'}`}>
        {dayLabel}
      </span>
      <span className="text-sm text-gray-700 flex-1 truncate">{menu}</span>
      <MealStatusBadge status={status} />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ChefDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ChefStats>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    getChefDashboardStats().then(setStats)
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

  const chefName = stats?.chef
    ? `${stats.chef.lastname} ${stats.chef.firstname}`
    : session?.user?.name ?? ''

  return (
    <DashboardLayout navItems={chefNavItems} role="Тогооч">

      {/* ── Header ── */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 capitalize">{today}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">
          Сайн байна уу{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      {/* ── Profile + Stats ── */}
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
              <Avatar name={chefName} />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">{chefName}</p>
                <p className="text-sm text-orange-500 font-medium mt-0.5">Тогооч</p>
                <div className="mt-2 space-y-1">
                  {stats.chef.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {stats.chef.phone}
                    </div>
                  )}
                  {stats.chef.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span className="truncate">{stats.chef.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Өнөөдрийн мэдээлэл</p>
          {!stats ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.presentCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Ирсэн хүүхэд</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.todayMeals.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Өнөөдрийн цэс</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Today's meals ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Өнөөдрийн хоолны цэс</p>
          <button
            onClick={() => router.push('/chef/meal')}
            className="text-xs text-[#6B4EFF] font-medium hover:underline"
          >
            Засах →
          </button>
        </div>
        {!stats ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : stats.todayMeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <p className="text-sm text-gray-400">Өнөөдрийн цэс бүртгэгдээгүй байна</p>
            <button
              onClick={() => router.push('/chef/meal')}
              className="text-xs text-[#6B4EFF] font-medium mt-1 hover:underline"
            >
              Цэс нэмэх →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.todayMeals.map(meal => (
              <div key={meal.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-gray-800 flex-1">{meal.menu}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {meal.allergyFlag && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">⚠ Харшил</span>
                    )}
                    <MealStatusBadge status={meal.status} />
                  </div>
                </div>
                {meal.ingredients && (
                  <p className="text-xs text-gray-400">{meal.ingredients}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── This week's meals ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">7 хоногийн цэс</p>
          <button
            onClick={() => router.push('/chef/weekly-meal')}
            className="text-xs text-[#6B4EFF] font-medium hover:underline"
          >
            Бүгдийг харах →
          </button>
        </div>
        {!stats ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : stats.weekMeals.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-6">7 хоногийн цэс байхгүй</p>
        ) : (
          <div className="space-y-1">
            {stats.weekMeals.map(meal => (
              <WeekDayRow
                key={meal.id}
                date={meal.date}
                menu={meal.menu}
                status={meal.status}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick links ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {chefNavItems.slice(1).map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-orange-50 group transition text-left"
            >
              <div className="w-7 h-7 bg-orange-50 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors shrink-0">
                <span className="text-orange-500 group-hover:text-white transition-colors">{item.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-700 leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </DashboardLayout>
  )
}
