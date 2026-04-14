'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getMyPayments } from '@/app/actions/parent'

export default function ParentPaymentPage() {
  const [student, setStudent] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    getMyPayments().then((d) => {
      setStudent(d.student)
      setPayments(d.payments)
    })
  }, [])

  const totalPaid = payments.filter((p) => p.status === 'Төлсөн').reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments.filter((p) => p.status !== 'Төлсөн').reduce((sum, p) => sum + Number(p.amount), 0)

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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-100">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Төлсөн</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{totalPaid.toLocaleString()}₮</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-red-100">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Төлөх</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{totalPending.toLocaleString()}₮</p>
        </div>
      </div>

      <div className="space-y-2">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{Number(p.amount).toLocaleString()}₮</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(p.date).toLocaleDateString('mn-MN')}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full w-fit ${
                p.status === 'Төлсөн' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {p.status}
            </span>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">Төлбөрийн мэдээлэл байхгүй байна</div>
        )}
      </div>
    </DashboardLayout>
  )
}
