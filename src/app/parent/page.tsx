'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { parentNavItems } from './parent-nav'

export default function ParentDashboard() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-gray-400">
        Уншиж байна...
      </div>
    )
  }

  return (
    <DashboardLayout navItems={parentNavItems} role="Эцэг эх">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Түргэн холбоос</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {parentNavItems.slice(1).map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm hover:shadow-md transition text-left group"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#F0EEFF] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#1E1B4B] transition-colors">
              <span className="text-[#6B4EFF] group-hover:text-white transition-colors">{item.icon}</span>
            </div>
            <p className="font-semibold text-gray-800 text-xs lg:text-sm leading-snug">{item.label}</p>
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}
