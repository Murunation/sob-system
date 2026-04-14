'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getRecentMealsForParent } from '@/app/actions/parent'

export default function ParentMealPage() {
  const [meals, setMeals] = useState<any[]>([])

  useEffect(() => {
    getRecentMealsForParent().then((m) => setMeals(m as any))
  }, [])

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      <div className="space-y-3">
        {meals.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800 text-sm">{new Date(m.date).toLocaleDateString('mn-MN')}</span>
              {m.allergyFlag && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">Харшил</span>
              )}
            </div>
            <div className="space-y-1">
              {m.menu.split('\n').map((line: string, i: number) => (
                <p key={i} className="text-sm text-gray-600">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {meals.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Хоолны цэс байхгүй байна</div>
        )}
      </div>
    </DashboardLayout>
  )
}
