'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPayments } from '@/app/actions/parent'

export default function ParentPaymentPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    getMyPayments().then(d => {
      setStudent(d.student)
      setPayments(d.payments)
    })
  }, [])

  const totalPaid = payments
    .filter(p => p.status === 'Төлсөн')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter(p => p.status !== 'Төлсөн')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/parent')} className="text-gray-400 hover:text-gray-600">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-800">Төлбөр</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {student && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <p className="font-bold text-gray-800">{student.lastname} {student.firstname}</p>
            <p className="text-sm text-gray-500">{student.group?.name}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600 mb-1">Төлсөн</p>
            <p className="text-2xl font-bold text-green-600">
              {totalPaid.toLocaleString()}₮
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-sm text-red-500 mb-1">Төлөх</p>
            <p className="text-2xl font-bold text-red-500">
              {totalPending.toLocaleString()}₮
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {Number(p.amount).toLocaleString()}₮
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(p.date).toLocaleDateString('mn-MN')}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                p.status === 'Төлсөн'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Төлбөрийн мэдээлэл байхгүй байна
            </div>
          )}
        </div>
      </main>
    </div>
  )
}