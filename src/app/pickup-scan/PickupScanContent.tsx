'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  scanPickupToken,
  recordPickupForStudents,
  type PickupScanResult,
} from '@/app/actions/pickup'

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm text-center">
        {children}
      </div>
    </div>
  )
}

function Spinner() {
  return <div className="w-10 h-10 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
}

function IconCircle({ color, children }: { color: 'green' | 'yellow' | 'red' | 'orange'; children: React.ReactNode }) {
  const bg = { green: 'bg-green-100', yellow: 'bg-yellow-100', red: 'bg-red-100', orange: 'bg-orange-100' }[color]
  return (
    <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      {children}
    </div>
  )
}

type ResolvedResult =
  | Extract<PickupScanResult, { success: true }>
  | Extract<PickupScanResult, { success: false }>

export default function PickupScanContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [result, setResult] = useState<PickupScanResult | null>(null)
  const [processing, setProcessing] = useState(false)

  // For student selector
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(`/pickup-scan?token=${token}`)
      router.push(`/login?callbackUrl=${callbackUrl}`)
      return
    }
    if (status === 'authenticated' && token && !result && !processing) {
      setProcessing(true)
      scanPickupToken(token)
        .then(setResult)
        .finally(() => setProcessing(false))
    }
  }, [status, token, result, processing, router])

  if (!token) {
    return (
      <Screen>
        <IconCircle color="red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </IconCircle>
        <h2 className="text-lg font-bold text-gray-800 mb-2">QR код буруу байна</h2>
        <p className="text-sm text-gray-400">Багшийн авалтын QR кодыг дахин уншуулна уу.</p>
      </Screen>
    )
  }

  if (status === 'loading' || processing) {
    return (
      <Screen>
        <Spinner />
        <p className="text-sm text-gray-500 font-medium">Бүртгэж байна...</p>
        <p className="text-xs text-gray-400 mt-1">Түр хүлээнэ үү</p>
      </Screen>
    )
  }

  // Multiple children — select screen
  if (result?.success === 'select') {
    const { pendingStudents } = result

    const toggle = (id: number) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }

    const handleConfirm = async () => {
      if (selected.size === 0 || result?.success !== 'select') return
      setSelecting(true)
      const res = await recordPickupForStudents(result.token, Array.from(selected))
      setResult(res)
      setSelecting(false)
    }

    return (
      <Screen>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Аль хүүхдийг авч байна вэ?</h2>
        <p className="text-sm text-gray-400 mb-5">Нэг буюу хэд хэдэн хүүхэд сонгоно уу</p>
        <div className="space-y-2 mb-5 text-left">
          {pendingStudents.map((s) => {
            const checked = selected.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                  checked ? 'border-[#1E1B4B] bg-[#f0eeff]' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center ${checked ? 'bg-[#1E1B4B]' : 'border-2 border-gray-300'}`}>
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800">{s.lastname} {s.firstname}</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={handleConfirm}
          disabled={selected.size === 0 || selecting}
          className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] disabled:opacity-40 transition"
        >
          {selecting ? 'Бүртгэж байна...' : `Бүртгэх (${selected.size})`}
        </button>
      </Screen>
    )
  }

  const resolved = result as ResolvedResult | null

  // Already recorded
  if (resolved?.success === true && resolved.alreadyRecorded) {
    return (
      <Screen>
        <IconCircle color="yellow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </IconCircle>
        <h2 className="text-lg font-bold text-yellow-600 mb-1">Аль хэдийн бүртгэсэн</h2>
        <p className="text-sm text-gray-500 mb-4">{resolved.message}</p>
        {resolved.students.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-1">
            {resolved.students.map((name) => <p key={name} className="text-sm font-medium text-gray-700">{name}</p>)}
          </div>
        )}
        <button onClick={() => router.push('/parent')} className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition">
          Буцах
        </button>
      </Screen>
    )
  }

  // Success
  if (resolved?.success === true && !resolved.alreadyRecorded) {
    return (
      <Screen>
        <IconCircle color="orange">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </IconCircle>
        <h2 className="text-lg font-bold text-orange-600 mb-1">Авалт бүртгэгдлээ!</h2>
        <p className="text-sm text-gray-500 mb-4">{resolved.message}</p>
        {resolved.students.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3 mb-5 space-y-1">
            {resolved.students.map((name) => <p key={name} className="text-sm font-semibold text-orange-700">{name}</p>)}
          </div>
        )}
        <p className="text-xs text-gray-400 mb-5">
          {new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' '}
          {new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button onClick={() => router.push('/parent')} className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition">
          Нүүр хуудас руу буцах
        </button>
      </Screen>
    )
  }

  // Error
  if (resolved?.success === false) {
    return (
      <Screen>
        <IconCircle color="red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </IconCircle>
        <h2 className="text-lg font-bold text-red-600 mb-2">Алдаа гарлаа</h2>
        <p className="text-sm text-gray-500 mb-5">{resolved.error}</p>
        <button onClick={() => router.push('/parent')} className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition">
          Буцах
        </button>
      </Screen>
    )
  }

  return null
}
