'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { CheckCircle, XCircle, Loader2, Mail, Shield } from 'lucide-react'

interface InviteData {
  id: string
  email: string
  role: string
  organization_id: string
  expires_at: string
  organization_name?: string
}

export default function InviteAcceptancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (token) {
      loadInvite()
    } else {
      setError('Invalid invitation link')
      setLoading(false)
    }
  }, [token])

  const loadInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('stakeholder_invites')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('token', token)
        .eq('used_at', null)
        .single()

      if (error) throw error

      if (!data) {
        setError('Invitation not found or already used')
        setLoading(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('Invitation has expired')
        setLoading(false)
        return
      }

      setInvite({
        ...data,
        organization_name: data.organizations?.name
      })
    } catch (error) {
      console.error('Error loading invite:', error)
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!invite || !name || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setAccepting(true)
    setError(null)

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('stakeholders')
        .select('user_id')
        .eq('email', invite.email)
        .eq('organization_id', invite.organization_id)
        .single()

      if (existingUser?.user_id) {
        // User already exists, just sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: invite.email,
          password: password
        })

        if (signInError) throw signInError

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        return
      }

      // Create new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // The stakeholder will be automatically created by the database trigger
      // Mark the invite as used
      const { error: updateError } = await supabase
        .from('stakeholder_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Error accepting invite:', error)
      setError(error.message || 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />
      case 'manager': return <Shield className="h-4 w-4 text-blue-500" />
      case 'contributor': return <Shield className="h-4 w-4 text-green-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'contributor': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to the team!</h2>
            <p className="text-gray-600 mb-4">
              You've successfully joined {invite?.organization_name}. Redirecting to dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            Join {invite?.organization_name} as a {invite?.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getRoleIcon(invite?.role || '')}
              <Badge className={getRoleColor(invite?.role || '')}>
                {invite?.role}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              You'll have access to {invite?.role === 'admin' ? 'all areas' : 
                invite?.role === 'manager' ? 'assigned areas with full control' : 
                'assigned areas with edit permissions'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={invite?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button 
            onClick={handleAcceptInvite} 
            disabled={accepting || !name || !password || !confirmPassword}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By accepting this invitation, you agree to join {invite?.organization_name} 
            and will have access to the CSRD Co-Pilot platform.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
