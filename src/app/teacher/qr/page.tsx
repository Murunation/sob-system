'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '../teacher-nav'
import { getTeacherQRToken } from '@/app/actions/qr'

const APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Хугацаа дуусжээ'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return h > 0 ? `${h}ц ${m}м ${s}с` : `${m}м ${s}с`
}

export default function TeacherQRPage() {
  const { status } = useSession()
  const router = useRouter()

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const loadQR = useCallback(async () => {
    setLoading(true)
    setError('')
    setExpired(false)
    setQrDataUrl(null)

    try {
      const { token, expiresAt: expiresAtISO } = await getTeacherQRToken()
      const scanUrl = `${APP_URL}/scan?token=${token}`

      // Динамик import — bundle хэмжээг бага байлгана
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(scanUrl, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#1E1B4B', light: '#FFFFFF' },
      })

      setQrDataUrl(dataUrl)
      setExpiresAt(new Date(expiresAtISO))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'QR код ачаалахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const ms = expiresAt.getTime() - Date.now()
      if (ms <= 0) {
        setTimeLeft('Хугацаа дуусжээ')
        setExpired(true)
        setQrDataUrl(null)
        clearInterval(timerRef.current!)
        return
      }
      setTimeLeft(formatTimeLeft(ms))
    }, 1_000)

    return () => clearInterval(timerRef.current!)
  }, [expiresAt])

  useEffect(() => {
    if (status === 'authenticated') loadQR()
  }, [status, loadQR])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">

          {/* Header */}
          <h1 className="text-lg font-bold text-gray-800 mb-1">QR Ирц бүртгэл</h1>
          <p className="text-xs text-gray-400 mb-6">
            {new Date().toLocaleDateString('mn-MN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-72 gap-3">
              <div className="w-8 h-8 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">QR код үүсгэж байна...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl p-4 mb-4">
              {error}
            </div>
          )}

          {/* QR Code */}
          {!loading && qrDataUrl && (
            <>
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR Code" width={280} height={280} />
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-mono font-semibold text-gray-700">{timeLeft}</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Эцэг эхчүүд утасны камераар энэ QR-г уншуулснаар
                хүүхдийнхээ ирц автоматаар бүртгэгдэнэ.
              </p>
            </>
          )}

          {/* Expired / Refresh */}
          {!loading && (expired || (!qrDataUrl && !error)) && (
            <div className="flex flex-col items-center gap-4 py-6">
              {expired && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Хугацаа дуусжээ
                </div>
              )}
              <button
                onClick={loadQR}
                className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition"
              >
                QR код шинэчлэх
              </button>
            </div>
          )}

        </div>

        {/* Info card */}
        <div className="mt-3 bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Хэрхэн ажилладаг вэ?</p>
          <ol className="space-y-1.5 text-xs text-gray-400 list-decimal list-inside">
            <li>QR код өдөр бүр шинэчлэгдэнэ (24 цаг хүчинтэй)</li>
            <li>Эцэг эх утасны камераар уншуулна</li>
            <li>Хүүхдийн ирц автоматаар бүртгэгдэнэ</li>
            <li>Нэг хүүхэд өдөрт зөвхөн 1 удаа бүртгэгдэнэ</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}
