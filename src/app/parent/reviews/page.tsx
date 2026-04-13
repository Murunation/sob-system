'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyChildReviews } from '@/app/actions/parent'

export default function ParentReviewsPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    getMyChildReviews().then(d => {
      setStudent(d.student)
      setReviews(d.reviews)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Хөгжлийн үнэлгээ</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {student && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <p className="font-bold text-gray-800">{student.lastname} {student.firstname}</p>
            <p className="text-sm text-gray-500">{student.group?.name}</p>
          </div>
        )}

        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Багш: {r.teacher.user.lastname} {r.teacher.user.firstname}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">Зан төлөв:</p>
                  <p className="text-sm text-gray-700">{r.behavior}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Хөгжил:</p>
                  <p className="text-sm text-gray-700">{r.development}</p>
                </div>
                {r.note && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Зөвлөгөө:</p>
                    <p className="text-sm text-gray-700">{r.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Үнэлгээ байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}