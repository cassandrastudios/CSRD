'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Target,
  Database,
  FileText,
  CheckCircle,
  Settings,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Materiality', href: '/materiality', icon: Target },
  { name: 'Data Hub', href: '/data', icon: Database },
  { name: 'Report Builder', href: '/report', icon: FileText },
  { name: 'Compliance', href: '/compliance', icon: CheckCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface NavigationProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Navigation({ isCollapsed, onToggle }: NavigationProps) {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-white border-r border-gray-200 min-h-screen transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center h-16 px-3">
          <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-2 text-xl font-bold text-gray-900">
              CSRD Co-Pilot
            </span>
          )}
        </div>
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full h-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center text-sm font-medium rounded-md transition-colors',
                isCollapsed
                  ? 'justify-center px-3 py-2 mx-2'
                  : 'px-3 py-2 mx-2',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={isCollapsed ? item.name : undefined}
              onClick={e => {
                // Don't expand nav when clicking navigation items
                e.stopPropagation();
              }}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Account Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              setIsAccountOpen(!isAccountOpen);
            }}
            className={cn(
              'flex items-center w-full text-sm font-medium rounded-md transition-colors',
              'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
            )}
            title={isCollapsed ? 'Account' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Account</span>}
          </Button>

          {isAccountOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
