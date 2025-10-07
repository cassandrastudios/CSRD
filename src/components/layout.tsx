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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
