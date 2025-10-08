'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { OrganizationSwitcher } from './OrganizationSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Load navigation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('nav-collapsed');
    if (savedState !== null) {
      setIsNavCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleNav = () => {
    const newState = !isNavCollapsed;
    setIsNavCollapsed(newState);
    // Save navigation state to localStorage
    localStorage.setItem('nav-collapsed', JSON.stringify(newState));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation isCollapsed={isNavCollapsed} onToggle={toggleNav} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Organization Switcher */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">CSRD Co-Pilot</h1>
            </div>
            <OrganizationSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
