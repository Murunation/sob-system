'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyChildWeeklyPlan } from '@/app/actions/parent'

export default function ParentWeeklyPlanPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    getMyChildWeeklyPlan().then(d => {
      setStudent(d.student)
      setPlans(d.plans)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Хичээлийн төлөвлөгөө</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {student && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <p className="font-bold text-gray-800">{student.lastname} {student.firstname}</p>
            <p className="text-sm text-gray-500">{student.group?.name}</p>
          </div>
        )}

        <div className="space-y-3">
          {plans.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">
                  {new Date(p.weekStart).toLocaleDateString('mn-MN')} — долоо хоног
                </span>
                {p.monthlyEvent && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                    📅 {p.monthlyEvent}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{p.content}</p>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Төлөвлөгөө байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}