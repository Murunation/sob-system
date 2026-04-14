'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyChildWeeklyPlan } from '@/app/actions/parent'

export default function ParentWeeklyPlanPage() {
  const [student, setStudent] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    getMyChildWeeklyPlan().then((d) => {
      setStudent(d.student)
      setPlans(d.plans)
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
        {plans.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <span className="font-semibold text-gray-800 text-sm">
                {new Date(p.weekStart).toLocaleDateString('mn-MN')} — долоо хоног
              </span>
              {p.monthlyEvent && (
                <span className="text-xs bg-[#F0EEFF] text-[#6B4EFF] px-2 py-0.5 rounded-full shrink-0">{p.monthlyEvent}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line">{p.content}</p>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Төлөвлөгөө байхгүй байна</div>
        )}
      </div>
    </DashboardLayout>
  )
}
