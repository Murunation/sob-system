'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import NotificationBell from '@/components/ui/NotificationBell'

type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

type DashboardLayoutProps = {
  children: ReactNode
  navItems: NavItem[]
  role: string
}

export default function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow shrink-0">
            <span className="text-[#1E1B4B] font-bold text-lg">С</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">СӨБ Систем</p>
            <p className="text-white/50 text-xs">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full shrink-0"></span>}
            </button>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {session?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{session?.user?.name}</p>
            <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 text-xs transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Гарах
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1E1B4B] min-h-screen flex-col fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-[#1E1B4B] z-50 flex flex-col transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800 truncate">
              {navItems.find(n => n.href === pathname)?.label || 'Нүүр'}
            </h1>
          </div>
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}