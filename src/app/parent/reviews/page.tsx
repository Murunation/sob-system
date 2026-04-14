'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyChildReviews } from '@/app/actions/parent'

export default function ParentReviewsPage() {
  const [student, setStudent] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    getMyChildReviews().then((d) => {
      setStudent(d.student)
      setReviews(d.reviews)
    })
  }, [])

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      {student && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="font-bold text-gray-800">
            {student.lastname} {student.firstname}
          </p>
          <p className="text-sm text-gray-500 mt-1">{student.group?.name}</p>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">
                Багш: {r.teacher.user.lastname} {r.teacher.user.firstname}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Зан төлөв</p>
                <p className="text-gray-700 mt-0.5">{r.behavior}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Хөгжил</p>
                <p className="text-gray-700 mt-0.5">{r.development}</p>
              </div>
              {r.note && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Зөвлөгөө</p>
                  <p className="text-gray-700 mt-0.5">{r.note}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Үнэлгээ байхгүй байна</div>
        )}
      </div>
    </DashboardLayout>
  )
}
