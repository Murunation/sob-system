'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from '@/app/parent/parent-nav'
import { getParentChildrenPayments, payForStudents } from '@/app/actions/payment'

const MONTH_NAMES = [
  '1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
  '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар',
]

const MONTHLY_FEE = 150000 // tugrug

type ChildPayment = {
  id: number
  firstname: string
  lastname: string
  group: { name: string } | null
  payments: { id: number; amount: unknown; status: string; dueDate: Date | null }[]
}

export default function ParentPaymentPage() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [children, setChildren] = useState<ChildPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Checkbox selection for unpaid children
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Modal & success states
  const [showModal, setShowModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getParentChildrenPayments(year, month)
    setChildren(data as unknown as ChildPayment[])
    setLoading(false)
  }

  useEffect(() => { load() }, [year, month])

  function getStatus(child: ChildPayment) {
    const pay = child.payments[0]
    return pay?.status ?? 'Хүлээгдэж буй'
  }

  function toggleChild(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const unpaidChildren = children.filter((c) => getStatus(c) !== 'Төлсөн')
  const paidChildren = children.filter((c) => getStatus(c) === 'Төлсөн')
  const selectedList = children.filter((c) => selected.has(c.id))
  const totalAmount = selectedList.length * MONTHLY_FEE

  async function handlePay() {
    if (selected.size === 0) return
    setPaying(true)
    const result = await payForStudents(Array.from(selected), year, month, MONTHLY_FEE)
    setPaying(false)
    setShowModal(false)
    if (result.ok) {
      setSelected(new Set())
      setShowSuccess(true)
      await load()
    }
  }

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800">Төлбөр</h1>
        <p className="text-sm text-gray-400 mt-0.5">{year} оны {MONTH_NAMES[month - 1]}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-300 shadow-sm">
          Хүүхдийн мэдээлэл байхгүй байна
        </div>
      ) : (
        <>
          {/* Unpaid section */}
          {unpaidChildren.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                Төлөх шаардлагатай
              </p>
              <div className="space-y-2">
                {unpaidChildren.map((child) => {
                  const checked = selected.has(child.id)
                  return (
                    <button
                      key={child.id}
                      onClick={() => toggleChild(child.id)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition text-left ${
                        checked
                          ? 'border-[#1E1B4B] bg-[#f0eeff] shadow-sm'
                          : 'border-gray-200 bg-white hover:border-purple-200'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center ${
                        checked ? 'bg-[#1E1B4B]' : 'border-2 border-gray-300'
                      }`}>
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">
                          {child.lastname} {child.firstname}
                        </p>
                        {child.group && (
                          <p className="text-xs text-gray-400 mt-0.5">{child.group.name}</p>
                        )}
                      </div>

                      {/* Amount & Status */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-700">{MONTHLY_FEE.toLocaleString()}₮</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Төлөөгүй</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Paid section */}
          {paidChildren.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                Төлсөн
              </p>
              <div className="space-y-2">
                {paidChildren.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-green-100 bg-white"
                  >
                    {/* Check icon */}
                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {child.lastname} {child.firstname}
                      </p>
                      {child.group && (
                        <p className="text-xs text-gray-400 mt-0.5">{child.group.name}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">{Number(child.payments[0]?.amount ?? MONTHLY_FEE).toLocaleString()}₮</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Төлсөн</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pay button */}
          {selected.size > 0 && (
            <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
              <button
                onClick={() => setShowModal(true)}
                className="w-full max-w-sm mx-auto block bg-[#1E1B4B] text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg hover:bg-[#2d2a6e] transition"
              >
                {selected.size}ш хүүхдийн төлбөр төлөх — {totalAmount.toLocaleString()}₮
              </button>
            </div>
          )}
        </>
      )}

      {/* Pay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-base font-bold text-gray-800 mb-1">Төлбөр төлөх</h2>
            <p className="text-sm text-gray-400 mb-4">{year} оны {MONTH_NAMES[month - 1]}</p>

            {/* Children list */}
            <div className="space-y-2 mb-5">
              {selectedList.map((child) => (
                <div key={child.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{child.lastname} {child.firstname}</p>
                    {child.group && <p className="text-xs text-gray-400">{child.group.name}</p>}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{MONTHLY_FEE.toLocaleString()}₮</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm font-medium text-gray-600">Нийт дүн</span>
              <span className="text-base font-bold text-[#1E1B4B]">{totalAmount.toLocaleString()}₮</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Болих
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 py-2.5 bg-[#1E1B4B] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2a6e] disabled:opacity-50 transition"
              >
                {paying ? 'Боловсруулж байна...' : 'Төлбөр төлөх'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-8 text-center shadow-xl">
            {/* Green check circle */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-green-600 mb-1">Амжилттай төлөгдлөө!</h2>
            <p className="text-sm text-gray-400 mb-5">
              {MONTH_NAMES[month - 1]}-ын төлбөр бүртгэгдлээ
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d2a6e] transition"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
