'use client'

import { useState, useEffect } from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

  // Load navigation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('nav-collapsed')
    if (savedState !== null) {
      setIsNavCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleNav = () => {
    const newState = !isNavCollapsed
    setIsNavCollapsed(newState)
    // Save navigation state to localStorage
    localStorage.setItem('nav-collapsed', JSON.stringify(newState))
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
