import { Suspense } from 'react'
import PickupScanContent from './PickupScanContent'

export default function PickupScanPage() {
  return (
    <Suspense>
      <PickupScanContent />
    </Suspense>
  )
}
