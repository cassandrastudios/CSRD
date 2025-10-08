'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, User, Building } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AcceptInvitePage() {
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  useEffect(() => {
    if (token) {
      fetchInviteDetails()
    } else {
      setError('No invitation token provided')
      setLoading(false)
    }
  }, [token])

  const fetchInviteDetails = async () => {
    try {
      // For now, we'll simulate fetching invite details
      // In a real implementation, you'd fetch from the database
      setInvite({
        email: 'danyiandras1993@gmail.com',
        role: 'contributor',
        organization_name: 'Your Organization',
        inviter_name: 'Team Admin',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching invite:', error)
      setError('Failed to load invitation details')
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    if (!token) return

    setAccepting(true)
    try {
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to sign up/login
        toast.error('Please sign up or log in to accept this invitation')
        // In a real implementation, you'd redirect to auth with the token
        return
      }

      // Accept the invitation
      // In a real implementation, you'd call an API to accept the invite
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Invitation accepted successfully!')
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error accepting invite:', error)
      toast.error('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isExpired ? (
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          )}
          <CardTitle className={isExpired ? 'text-red-600' : 'text-green-600'}>
            {isExpired ? 'Invitation Expired' : 'You\'re Invited!'}
          </CardTitle>
          <CardDescription>
            {isExpired 
              ? 'This invitation has expired and can no longer be accepted.'
              : 'You have been invited to join a team on CSRD Co-Pilot'
            }
          </CardDescription>
        </CardHeader>
        
        {!isExpired && invite && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Invited by</p>
                  <p className="text-sm text-gray-600">{invite.inviter_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Organization</p>
                  <p className="text-sm text-gray-600">{invite.organization_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-gray-600 capitalize">{invite.role}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={acceptInvite} 
                disabled={accepting}
                className="w-full"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By accepting this invitation, you agree to join the team and will be granted {invite.role} access.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
