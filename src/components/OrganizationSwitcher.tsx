'use client'

import { useState } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building, ChevronDown, Check, Plus } from 'lucide-react'

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, setCurrentOrganization, loading, userJoinedViaInvite } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No organization</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-0"
      >
        <Building className="h-4 w-4 flex-shrink-0" />
        <span className="truncate max-w-32">
          {currentOrganization.name}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full left-0 mt-2 w-80 z-20 shadow-lg">
            <CardContent className="p-2">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {userJoinedViaInvite ? 'Invited Organization' : 'Your Organization'}
                </div>
                
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setCurrentOrganization(org)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                      currentOrganization.id === org.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Building className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{org.name}</div>
                        {org.sector && (
                          <div className="text-xs text-gray-500 truncate">{org.sector}</div>
                        )}
                      </div>
                    </div>
                    {currentOrganization.id === org.id && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
                
                <div className="border-t border-gray-200 my-1" />
                
                <button
                  onClick={() => {
                    // TODO: Implement create organization functionality
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span>Create Organization</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
