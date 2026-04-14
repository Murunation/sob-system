'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  scanQRToken,
  recordQRForStudents,
  type ScanResult,
  type PendingStudent,
} from '@/app/actions/qr'

// ── Types ──────────────────────────────────────────────────────────────────

type ScannerState =
  | { phase: 'idle' }
  | { phase: 'requesting' }
  | { phase: 'scanning' }
  | { phase: 'processing' }
  | { phase: 'selecting'; pendingStudents: PendingStudent[]; token: string; teacherId: number }
  | { phase: 'done'; result: Exclude<ScanResult, { success: 'select' }> }
  | { phase: 'error'; message: string }

// ── Helpers ────────────────────────────────────────────────────────────────

function extractToken(raw: string): string | null {
  try {
    const url = new URL(raw)
    return url.searchParams.get('token')
  } catch {
    if (/^[0-9a-f-]{36}$/.test(raw)) return raw
    return null
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      {children}
    </div>
  )
}

// Хүүхэд сонгох дэлгэц
function StudentSelector({
  pendingStudents,
  token,
  teacherId,
  onResult,
  onClose,
}: {
  pendingStudents: PendingStudent[]
  token: string
  teacherId: number
  onResult: (r: Exclude<ScanResult, { success: 'select' }>) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    if (selected.size === 0) return
    setLoading(true)
    const result = await recordQRForStudents(token, Array.from(selected))
    onResult(result)
  }

  return (
    <Overlay>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">Аль хүүхдийг ирүүлсэн бэ?</h2>
        <p className="text-sm text-gray-400 text-center mb-5">Нэг буюу хэд хэдэн хүүхэд сонгоно уу</p>

        <div className="space-y-2 mb-5">
          {pendingStudents.map((s) => {
            const checked = selected.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                  checked
                    ? 'border-[#1E1B4B] bg-[#f0eeff]'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    checked ? 'bg-[#1E1B4B]' : 'border-2 border-gray-300'
                  }`}
                >
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

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
          >
            Болих
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || loading}
            className="flex-1 bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] disabled:opacity-40 transition"
          >
            {loading ? 'Бүртгэж байна...' : `Бүртгэх (${selected.size})`}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function ResultCard({
  result,
  onClose,
}: {
  result: Exclude<ScanResult, { success: 'select' }>
  onClose: () => void
}) {
  const success = result.success

  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <Overlay>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            !success
              ? 'bg-red-100'
              : (result as any).alreadyRecorded
              ? 'bg-yellow-100'
              : 'bg-green-100'
          }`}
        >
          {!success ? (
            <svg width="32" height="32" fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (result as any).alreadyRecorded ? (
            <svg width="32" height="32" fill="none" stroke="#D97706" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="32" height="32" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-lg font-bold mb-1 ${
            !success ? 'text-red-600' : (result as any).alreadyRecorded ? 'text-yellow-600' : 'text-green-600'
          }`}
        >
          {!success
            ? 'Алдаа гарлаа'
            : (result as any).alreadyRecorded
            ? 'Аль хэдийн бүртгэсэн'
            : 'Ирц бүртгэгдлээ!'}
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-4">
          {success ? (result as any).message : (result as any).error}
        </p>

        {/* Student names */}
        {success && (result as any).students?.length > 0 && (
          <div
            className={`rounded-xl p-3 mb-4 space-y-1 ${
              (result as any).alreadyRecorded ? 'bg-gray-50' : 'bg-green-50'
            }`}
          >
            {(result as any).students.map((name: string) => (
              <p
                key={name}
                className={`text-sm font-semibold ${
                  (result as any).alreadyRecorded ? 'text-gray-700' : 'text-green-700'
                }`}
              >
                {name}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition"
        >
          Хаах
        </button>
        <p className="text-xs text-gray-300 mt-2">3 секундын дараа автоматаар хаагдана</p>
      </div>
    </Overlay>
  )
}

// ── Main QRScanner ─────────────────────────────────────────────────────────

interface QRScannerProps {
  onSuccess?: () => void
}

export default function QRScanner({ onSuccess }: QRScannerProps) {
  const [state, setState] = useState<ScannerState>({ phase: 'idle' })
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectedRef = useRef(false)

  // ── Camera cleanup ──
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    detectedRef.current = false
  }, [])

  const close = useCallback(() => {
    stopCamera()
    setState({ phase: 'idle' })
  }, [stopCamera])

  // ── QR scan loop ──
  const startScanLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const tick = async () => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const jsQR = (await import('jsqr')).default
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code && !detectedRef.current) {
        detectedRef.current = true
        stopCamera()

        const token = extractToken(code.data)
        if (!token) {
          setState({ phase: 'error', message: 'Буруу QR код уншигдлаа. Багшийн QR кодыг ашиглана уу.' })
          return
        }

        setState({ phase: 'processing' })
        const result = await scanQRToken(token)

        if (result.success === 'select') {
          // Олон хүүхэд байна → сонгуулах
          setState({
            phase: 'selecting',
            pendingStudents: result.pendingStudents,
            token: result.token,
            teacherId: result.teacherId,
          })
          return
        }

        setState({ phase: 'done', result })
        if (result.success && !result.alreadyRecorded) onSuccess?.()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [stopCamera, onSuccess])

  // ── Open camera ──
  const openCamera = useCallback(async () => {
    setState({ phase: 'requesting' })
    detectedRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setState({ phase: 'scanning' })
      startScanLoop()
    } catch (err: unknown) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')

      setState({
        phase: 'error',
        message: isDenied
          ? 'Камерт хандах зөвшөөрөл олгоно уу.'
          : 'Камер нээхэд алдаа гарлаа.',
      })
    }
  }, [startScanLoop])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ── Render ─────────────────────────────────────────────────────────────

  if (state.phase === 'idle') {
    return (
      <button
        onClick={openCamera}
        className="flex items-center gap-2 bg-[#1E1B4B] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] active:scale-95 transition w-full sm:w-auto justify-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
        QR уншуулах
      </button>
    )
  }

  if (state.phase === 'requesting') {
    return (
      <Overlay>
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Камер нээж байна...</p>
        </div>
      </Overlay>
    )
  }

  if (state.phase === 'processing') {
    return (
      <Overlay>
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Ирц бүртгэж байна...</p>
        </div>
      </Overlay>
    )
  }

  if (state.phase === 'scanning') {
    return (
      <Overlay>
        <canvas ref={canvasRef} className="hidden" />
        <div className="relative w-full max-w-sm">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full rounded-2xl object-cover"
            style={{ maxHeight: '60vh' }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52">
              {[
                'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
              ))}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-white/70 animate-[scanline_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
        <p className="text-white text-sm mt-5 font-medium">QR код руу чиглүүлнэ үү</p>
        <p className="text-white/60 text-xs mt-1 mb-6">Автоматаар уншигдана</p>
        <button
          onClick={close}
          className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/20 transition"
        >
          Болих
        </button>
      </Overlay>
    )
  }

  if (state.phase === 'selecting') {
    return (
      <StudentSelector
        pendingStudents={state.pendingStudents}
        token={state.token}
        teacherId={state.teacherId}
        onResult={(result) => {
          setState({ phase: 'done', result })
          if (result.success && !result.alreadyRecorded) onSuccess?.()
        }}
        onClose={close}
      />
    )
  }

  if (state.phase === 'error') {
    return (
      <Overlay>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-800 mb-2">Алдаа</h2>
          <p className="text-sm text-gray-500 mb-5">{state.message}</p>
          <button
            onClick={close}
            className="w-full bg-[#1E1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d2a6e] transition"
          >
            Буцах
          </button>
        </div>
      </Overlay>
    )
  }

  if (state.phase === 'done') {
    return <ResultCard result={state.result} onClose={close} />
  }

  return null
}
