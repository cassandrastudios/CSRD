'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Organization {
  id: string
  name: string
  sector?: string
  employee_count?: string
  first_reporting_year?: number
  created_at: string
  updated_at: string
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  setCurrentOrganization: (org: Organization | null) => void
  refreshOrganizations: () => Promise<void>
  loading: boolean
  userJoinedViaInvite: boolean | null
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [userJoinedViaInvite, setUserJoinedViaInvite] = useState<boolean | null>(null)
  const supabase = createClient()

  const refreshOrganizations = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setOrganizations([])
        setCurrentOrganization(null)
        return
      }

      // Try to fetch organizations from database via API
      try {
        const response = await fetch('/api/organizations')
        const result = await response.json()
        
        if (!result.success) {
          console.log('Database error, using fallback organizations:', result.error)
          // Fallback: create a default organization
          const fallbackOrg: Organization = {
            id: `local-${user.id}`,
            name: 'My Organization',
            sector: 'Technology',
            employee_count: '1',
            first_reporting_year: new Date().getFullYear() + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setOrganizations([fallbackOrg])
          setCurrentOrganization(fallbackOrg)
          return
        }

        const orgs = result.data || []

        if (orgs && orgs.length > 0) {
          console.log('Found organizations:', orgs)
          
          // Check if user joined via invite by looking for activeOrganizationId in localStorage
          const activeOrgId = localStorage.getItem('activeOrganizationId')
          const joinedViaInvite = !!activeOrgId
          setUserJoinedViaInvite(joinedViaInvite)
          
          let filteredOrgs = orgs
          
          if (joinedViaInvite) {
            // User joined via invite - show only the invited organization
            const invitedOrg = orgs.find(org => org.id === activeOrgId)
            filteredOrgs = invitedOrg ? [invitedOrg] : []
            console.log('User joined via invite, showing only invited org:', invitedOrg)
          } else {
            // User created their own org - show only their created organization
            // Find the organization created by this user (not via invite)
            // Check if there's a currentOrganizationId in localStorage (set during onboarding)
            const currentOrgId = localStorage.getItem('currentOrganizationId')
            const userCreatedOrg = currentOrgId 
              ? orgs.find(org => org.id === currentOrgId)
              : orgs.find(org => 
                  !org.id.startsWith('local-') && 
                  org.created_at && 
                  new Date(org.created_at).getTime() > (Date.now() - 24 * 60 * 60 * 1000) // Created within last 24 hours
                )
            filteredOrgs = userCreatedOrg ? [userCreatedOrg] : orgs.slice(0, 1) // Fallback to first org
            console.log('User created org, showing only their org:', userCreatedOrg)
            if (currentOrgId) {
              console.log('Found currentOrganizationId in localStorage:', currentOrgId)
            }
          }
          
          setOrganizations(filteredOrgs)
          
          // Set the active organization
          if (activeOrgId) {
            const activeOrg = filteredOrgs.find(org => org.id === activeOrgId)
            if (activeOrg) {
              console.log('Setting active organization from localStorage (invite):', activeOrg)
              setCurrentOrganization(activeOrg)
              // Clear the localStorage after using it
              localStorage.removeItem('activeOrganizationId')
            }
          } else if (currentOrgId) {
            const currentOrg = filteredOrgs.find(org => org.id === currentOrgId)
            if (currentOrg) {
              console.log('Setting current organization from localStorage (onboarding):', currentOrg)
              setCurrentOrganization(currentOrg)
              // Clear the localStorage after using it
              localStorage.removeItem('currentOrganizationId')
            }
          } else if (!currentOrganization && filteredOrgs.length > 0) {
            console.log('Setting first organization as current:', filteredOrgs[0])
            setCurrentOrganization(filteredOrgs[0])
          }
        } else {
          // No organizations found, create a default one
          const defaultOrg: Organization = {
            id: `local-${user.id}`,
            name: 'My Organization',
            sector: 'Technology',
            employee_count: '1',
            first_reporting_year: new Date().getFullYear() + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setOrganizations([defaultOrg])
          setCurrentOrganization(defaultOrg)
        }
      } catch (dbError) {
        console.log('Database not available, using fallback organizations')
        // Fallback: create a default organization
        const fallbackOrg: Organization = {
          id: `local-${user.id}`,
          name: 'My Organization',
          sector: 'Technology',
          employee_count: '1',
          first_reporting_year: new Date().getFullYear() + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setOrganizations([fallbackOrg])
        setCurrentOrganization(fallbackOrg)
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
      setOrganizations([])
      setCurrentOrganization(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check localStorage first for cached organization
    const cachedOrg = localStorage.getItem('currentOrganization')
    if (cachedOrg) {
      try {
        const parsedOrg = JSON.parse(cachedOrg)
        setCurrentOrganization(parsedOrg)
        console.log('Loaded organization from localStorage:', parsedOrg)
      } catch (error) {
        console.log('Failed to parse cached organization:', error)
      }
    }
    
    refreshOrganizations()
  }, [])

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        setCurrentOrganization,
        refreshOrganizations,
        loading,
        userJoinedViaInvite,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    // Return a default context instead of throwing an error
    return {
      currentOrganization: null,
      organizations: [],
      setCurrentOrganization: () => {},
      refreshOrganizations: async () => {},
      loading: false,
      userJoinedViaInvite: false
    }
  }
  return context
}
