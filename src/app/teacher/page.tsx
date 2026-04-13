'use client'

import NotificationBell from '@/components/ui/NotificationBell'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherDashboard() {
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
    <h1 className="text-xl font-bold text-gray-800">Багшийн дэлгэц</h1>
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
            onClick={() => router.push('/teacher/attendance')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-800">Ирц бүртгэх</h3>
            <p className="text-sm text-gray-500 mt-1">Өдрийн ирц бүртгэх</p>
          </button>

          <button
            onClick={() => router.push('/teacher/reviews')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-800">Хөгжлийн үнэлгээ</h3>
            <p className="text-sm text-gray-500 mt-1">Үнэлгээ бичих, илгээх</p>
          </button>

          <button
            onClick={() => router.push('/teacher/weekly-plan')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800">7 хоногийн төлөвлөгөө</h3>
            <p className="text-sm text-gray-500 mt-1">Төлөвлөгөө оруулах</p>
          </button>

          <button
            onClick={() => router.push('/teacher/meal-log')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">🍱</div>
            <h3 className="font-semibold text-gray-800">Хооллолт</h3>
            <p className="text-sm text-gray-500 mt-1">Хоол идсэн байдал тэмдэглэх</p>
          </button>

          <button
            onClick={() => router.push('/teacher/feedback')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-800">Санал хүсэлт</h3>
            <p className="text-sm text-gray-500 mt-1">Эцэг эхийн хүсэлтэд хариулах</p>
          </button>

          <button
            onClick={() => router.push('/teacher/reports')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800">Тайлан</h3>
            <p className="text-sm text-gray-500 mt-1">Сарын тайлан илгээх</p>
          </button>
        </div>
      </main>
    </div>
  )
}