'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, Users, Building, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface Invite {
  id: string
  email: string
  role: string
  token: string
  expires_at: string
  organization_id: string
  organization_name: string
  inviter_name: string
}

export default function OnboardInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<Invite | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onboarding, setOnboarding] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (token) {
      fetchInvite(token)
    } else {
      setError('No invitation token provided.')
      setLoading(false)
    }
  }, [token])

  const fetchInvite = async (inviteToken: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/validate-invite?token=${inviteToken}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invite details')
      }

      setInvite(data.invite)
      if (new Date(data.invite.expires_at) < new Date()) {
        setError('This invitation has expired.')
      }
    } catch (err: any) {
      console.error('Error fetching invite:', err)
      setError(err.message || 'Failed to load invitation details.')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboarding = async () => {
    if (!invite) return

    // Validate form
    if (!formData.displayName.trim()) {
      toast.error('Please enter your display name')
      return
    }

    if (!formData.password) {
      toast.error('Please enter a password')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setOnboarding(true)
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            organization_id: invite.organization_id,
            role: invite.role,
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Store organization membership
        try {
          await supabase.from('user_roles').insert({
            user_id: authData.user.id,
            organization_id: invite.organization_id,
            role: invite.role,
          })
        } catch (dbError) {
          console.log('Database table not available, continuing without database storage')
        }

        toast.success(`Welcome to ${invite.organization_name}!`)
        router.push('/dashboard')
      } else {
        throw new Error('Failed to create account')
      }
    } catch (err: any) {
      console.error('Error during onboarding:', err)
      toast.error(err.message || 'Failed to create account. Please try again.')
    } finally {
      setOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading invitation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {error ? (
            <div className="text-red-500">
              <p className="text-lg font-medium">Invitation Invalid</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Welcome to {invite?.organization_name}!</CardTitle>
              <CardDescription>
                Complete your account setup to join the team
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {invite && !error && (
            <>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email: <span className="font-medium ml-1">{invite.email}</span>
                </p>
                <p className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  Organization: <span className="font-medium ml-1">{invite.organization_name}</span>
                </p>
                <p className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  Role: <span className="font-medium ml-1 capitalize">{invite.role}</span>
                </p>
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Invited by: <span className="font-medium ml-1">{invite.inviter_name}</span>
                </p>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Personal Information</h4>
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Organization Information (Read-only) */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Organization Information</h4>
                <p className="text-sm text-gray-600">
                  You're being invited to join this organization. These details cannot be changed.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Organization Name</Label>
                    <Input
                      value={invite.organization_name}
                      disabled
                      className="mt-1 bg-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Organization ID</Label>
                    <Input
                      value={invite.organization_id}
                      disabled
                      className="mt-1 bg-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Your Role</Label>
                    <Input
                      value={invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                      disabled
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOnboarding}
                disabled={onboarding}
                className="w-full"
              >
                {onboarding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Join Team'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to join {invite.organization_name} as a {invite.role}.
              </p>
            </>
          )}

          {error && (
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Go to Homepage
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
