'use client'

import { useState } from 'react'
import { Navigation } from './navigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation isCollapsed={isNavCollapsed} onToggle={toggleNav} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">CSRD Co-Pilot</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
