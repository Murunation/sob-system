'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import NotificationBell from '@/components/ui/NotificationBell'

export default function ChefDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') return <div className="p-8">Уншиж байна...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
  <div>
    <h1 className="text-xl font-bold text-gray-800">Тогоочийн дэлгэц</h1>
    <p className="text-sm text-gray-500">{session?.user?.name}</p>
  </div>
  <div className="flex items-center gap-3">
    <NotificationBell />
    <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-red-500 hover:text-red-700">
      Гарах
    </button>
  </div>
</header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/chef/meal')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="font-semibold text-gray-800">Өдрийн цэс</h3>
            <p className="text-sm text-gray-500 mt-1">Өдрийн цэс оруулах, засах</p>
          </button>

          <button
            onClick={() => router.push('/chef/weekly-meal')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800">7 хоногийн цэс</h3>
            <p className="text-sm text-gray-500 mt-1">7 хоногоор цэс төлөвлөх</p>
          </button>

          <button
            onClick={() => router.push('/chef/attendance-count')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-800">Ирцийн тоо</h3>
            <p className="text-sm text-gray-500 mt-1">Өнөөдрийн хоол идэх тоо</p>
          </button>

          <button
            onClick={() => router.push('/chef/reports')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800">Хоолны тайлан</h3>
            <p className="text-sm text-gray-500 mt-1">Тайлан гаргаж эрхлэгчид илгээх</p>
          </button>
        </div>
      </main>
    </div>
  )
}