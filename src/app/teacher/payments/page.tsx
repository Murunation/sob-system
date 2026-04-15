'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '@/app/teacher/teacher-nav'
import { getTeacherPayments, sendPaymentReminder } from '@/app/actions/payment'
import type { PaymentRow } from '@/services/payment.service'

const MONTH_NAMES = [
  '1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
  '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар',
]

export default function TeacherPaymentsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    const data = await getTeacherPayments(year, month)
    setRows(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [year, month])

  async function handleReminder(row: PaymentRow) {
    if (!row.parentUserId) return
    setSending(row.studentId)
    await sendPaymentReminder(
      row.parentUserId,
      `${row.studentLastname} ${row.studentFirstname}`,
      MONTH_NAMES[month - 1]
    )
    setSending(null)
    showToast('Сануулга илгээгдлээ')
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const paid = rows.filter((r) => r.status === 'Төлсөн').length
  const unpaid = rows.length - paid

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Төлбөрийн бүртгэл</h1>
          <p className="text-sm text-gray-400 mt-0.5">{year} оны {MONTH_NAMES[month - 1]}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]/20"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]/20"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{rows.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Нийт хүүхэд</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-100">
          <p className="text-2xl font-bold text-green-600">{paid}</p>
          <p className="text-xs text-green-500 mt-0.5">Төлсөн</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-red-100">
          <p className="text-2xl font-bold text-red-500">{unpaid}</p>
          <p className="text-xs text-red-400 mt-0.5">Төлөөгүй</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
          Мэдээлэл байхгүй байна
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Хүүхэд</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Эцэг эх</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.studentLastname} {row.studentFirstname}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.parentLastname && row.parentFirstname
                        ? `${row.parentLastname} ${row.parentFirstname}`
                        : <span className="text-gray-300 italic">Холбоогүй</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        row.status === 'Төлсөн'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {row.status === 'Төлсөн' ? 'Төлсөн' : 'Төлөөгүй'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.status !== 'Төлсөн' && row.parentUserId && (
                        <button
                          onClick={() => handleReminder(row)}
                          disabled={sending === row.studentId}
                          className="text-xs px-3 py-1.5 bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a6e] disabled:opacity-50 transition"
                        >
                          {sending === row.studentId ? 'Илгээж байна...' : 'Сануулга'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E1B4B] text-white text-sm px-5 py-3 rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </DashboardLayout>
  )
}
