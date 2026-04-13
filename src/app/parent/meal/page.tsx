'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRecentMealsForParent } from '@/app/actions/parent'

export default function ParentMealPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<any[]>([])

  useEffect(() => {
    getRecentMealsForParent().then(m => setMeals(m as any))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Хоолны цэс</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <div className="space-y-3">
          {meals.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">
                  {new Date(m.date).toLocaleDateString('mn-MN')}
                </span>
                {m.allergyFlag && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    ⚠️ Харшил
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {m.menu.split('\n').map((line: string, i: number) => (
                  <p key={i} className="text-sm text-gray-600">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {meals.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Хоолны цэс байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}