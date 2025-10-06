'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication state...')
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session check result:', { session, sessionError })
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setAuthError(sessionError.message)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('User authenticated:', session.user.email)
          setUser(session.user)
        } else {
          console.log('No user session found')
          setUser(null)
        }
        
        setLoading(false)
      } catch (error: any) {
        console.error('Auth check error:', error)
        setAuthError(error.message)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, updating state')
        setUser(session.user)
        setAuthError(null)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state')
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setAuthError(null)
    // Re-check auth
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Retry session check:', { session, error })
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-gray-600">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              There was an issue checking your authentication status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">{authError}</p>
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline">
                Retry
              </Button>
              <Button onClick={() => router.push('/auth')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Debug info for Cursor browser */}
      <div className="bg-blue-50 border-b border-blue-200 p-2 text-xs text-blue-800">
        <strong>Debug:</strong> User: {user.email} | ID: {user.id.slice(0, 8)}... | 
        <button 
          onClick={handleSignOut}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Sign Out
        </button>
      </div>
      {children}
    </div>
  )
}
