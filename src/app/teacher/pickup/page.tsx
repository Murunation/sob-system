'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { teacherNavItems } from '../teacher-nav'
import {
  getTeacherPickupToken,
  getPickupStatus,
  teacherConfirmAllPickedUp,
} from '@/app/actions/pickup'

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

type StudentStatus = {
  id: number
  firstname: string
  lastname: string
  pickedUp: boolean
  pickedUpAt: string | null
  pickedUpBy: string | null
}

export default function TeacherPickupPage() {
  const { status } = useSession()
  const router = useRouter()

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [loadingQr, setLoadingQr] = useState(true)
  const [qrError, setQrError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [students, setStudents] = useState<StudentStatus[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const loadQR = useCallback(async () => {
    setLoadingQr(true)
    setQrError('')
    setExpired(false)
    setQrDataUrl(null)
    try {
      const { token, expiresAt: expiresAtISO } = await getTeacherPickupToken()
      const scanUrl = `${APP_URL}/pickup-scan?token=${token}`
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(scanUrl, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#1E1B4B', light: '#FFFFFF' },
      })
      setQrDataUrl(dataUrl)
      setExpiresAt(new Date(expiresAtISO))
    } catch (e: unknown) {
      setQrError(e instanceof Error ? e.message : 'QR код ачаалахад алдаа гарлаа')
    } finally {
      setLoadingQr(false)
    }
  }, [])

  const loadStudents = useCallback(async () => {
    try {
      const data = await getPickupStatus()
      setStudents(data.map((s) => ({ ...s, pickedUpAt: s.pickedUpAt ? s.pickedUpAt.toISOString() : null })))
    } catch {
      // silent
    } finally {
      setLoadingStudents(false)
    }
  }, [])

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
    if (status !== 'authenticated') return
    loadQR()
    loadStudents()

    // Poll students every 15 seconds
    pollRef.current = setInterval(loadStudents, 15_000)
    return () => clearInterval(pollRef.current!)
  }, [status, loadQR, loadStudents])

  const handleConfirm = async () => {
    if (!confirm('Бүх хүүхдийг хүлээлгэж өгснийг баталгаажуулах уу? Admin-д мэдэгдэл явуулна.')) return
    setConfirming(true)
    try {
      await teacherConfirmAllPickedUp()
      setConfirmed(true)
    } catch {
      alert('Алдаа гарлаа')
    } finally {
      setConfirming(false)
    }
  }

  const pickedCount = students.filter((s) => s.pickedUp).length
  const totalCount = students.length
  const allPickedUp = totalCount > 0 && pickedCount === totalCount

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout navItems={teacherNavItems} role="Багш">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* QR Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h1 className="text-lg font-bold text-gray-800 mb-1">Авалтын QR код</h1>
          <p className="text-xs text-gray-400 mb-5">
            Эцэг эхчүүд орой хүүхдийг авахдаа энэ QR-г скан хийнэ
          </p>

          {loadingQr && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">QR код үүсгэж байна...</p>
            </div>
          )}

          {!loadingQr && qrError && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl p-4 mb-4">
              {qrError}
            </div>
          )}

          {!loadingQr && qrDataUrl && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 inline-block">
                  <img src={qrDataUrl} alt="Авалтын QR" width={260} height={260} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-sm font-mono font-semibold text-gray-700">{timeLeft}</span>
              </div>
            </>
          )}

          {!loadingQr && (expired || (!qrDataUrl && !qrError)) && (
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

        {/* Student list */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">
              Хүүхдийн авалтын байдал
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {pickedCount}/{totalCount}
              </span>
              <button
                onClick={loadStudents}
                className="text-xs text-[#1E1B4B] hover:underline"
              >
                Шинэчлэх
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mb-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 transition-all duration-500"
                style={{ width: `${(pickedCount / totalCount) * 100}%` }}
              />
            </div>
          )}

          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Бүлэгт хүүхэд бүртгэгдээгүй байна
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    s.pickedUp
                      ? 'bg-green-50 border-green-100'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        s.pickedUp ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    >
                      {s.pickedUp ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {s.lastname} {s.firstname}
                      </p>
                      {s.pickedUp && s.pickedUpBy && (
                        <p className="text-xs text-gray-500">
                          {s.pickedUpBy} авсан
                        </p>
                      )}
                    </div>
                  </div>
                  {s.pickedUp && s.pickedUpAt && (
                    <span className="text-xs text-green-600 font-medium">
                      {new Date(s.pickedUpAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {!s.pickedUp && (
                    <span className="text-xs text-gray-400">Хүлээж байна</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Confirm button */}
          {!confirmed && (
            <button
              onClick={handleConfirm}
              disabled={confirming || !allPickedUp}
              className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold transition ${
                allPickedUp && !confirming
                  ? 'bg-[#1E1B4B] text-white hover:bg-[#2d2a6e]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {confirming
                ? 'Илгээж байна...'
                : allPickedUp
                ? 'Бүгдийг хүлээлгэж өглөө — Admin-д мэдэгдэх'
                : `Бүгдийг хүлээлгэж өгөх (${totalCount - pickedCount} хүүхэд үлдсэн)`}
            </button>
          )}

          {confirmed && (
            <div className="mt-5 flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl text-green-700 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Admin-д амжилттай мэдэгдэл явуулсан
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
