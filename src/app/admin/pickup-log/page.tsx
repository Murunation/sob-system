'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { adminNavItems } from '../admin-nav'
import { getPickupSessionList } from '@/app/actions/pickup'

type Session = {
  id: number
  completedAt: string
  date: string
  teacher: {
    user: { firstname: string; lastname: string }
    group: { name: string } | null
  }
}

export default function PickupLogPage() {
  const { status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    getPickupSessionList()
      .then((data) =>
        setSessions(
          data.map((s) => ({
            id: s.id,
            completedAt: s.completedAt.toISOString(),
            date: s.date.toISOString(),
            teacher: s.teacher,
          }))
        )
      )
      .finally(() => setLoading(false))
  }, [status])

  return (
    <DashboardLayout navItems={adminNavItems} role="Эрхлэгч">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Авалтын бүртгэл</h1>
          <span className="text-sm text-gray-400">Нийт: {sessions.length}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">Одоогоор авалтын бүртгэл байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const completedAt = new Date(s.completedAt)
              const date = new Date(s.date)
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {s.teacher.user.lastname} {s.teacher.user.firstname} багш
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.teacher.group?.name ?? 'Бүлэггүй'} •{' '}
                        {date.toLocaleDateString('mn-MN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-600">
                      {completedAt.toLocaleTimeString('mn-MN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">Хүлээлгэж өгсөн цаг</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
