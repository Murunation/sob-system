import { Suspense } from 'react'
import ScanContent from './ScanContent'

export const dynamic = 'force-dynamic'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScanContent />
    </Suspense>
  )
}
