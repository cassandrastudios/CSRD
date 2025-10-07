import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'

export function useOrganization() {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadOrganization()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadOrganization = async () => {
    if (!user) return

    try {
      // First, try to get organization from stakeholders table
      const { data: stakeholderData } = await supabase
        .from('stakeholders')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            sector,
            employee_count,
            first_reporting_year
          )
        `)
        .eq('user_id', user.id)
        .single()

      if (stakeholderData?.organizations) {
        setOrganization(stakeholderData.organizations)
      } else {
        // If no stakeholder record, get organization by created_by
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('created_by', user.id)
          .single()

        if (orgData) {
          setOrganization(orgData)
        }
      }
    } catch (error) {
      console.error('Error loading organization:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    organization,
    loading,
    refresh: loadOrganization
  }
}
