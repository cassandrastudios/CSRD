'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session data:', session)
        console.log('Session error:', error)
        
        setSession(session)
        setUser(session?.user || null)
        
        // Collect debug info
        setDebugInfo({
          userAgent: navigator.userAgent,
          origin: window.location.origin,
          href: window.location.href,
          protocol: window.location.protocol,
          host: window.location.host,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          cookies: document.cookie,
          localStorage: Object.keys(localStorage).length,
          sessionStorage: Object.keys(sessionStorage).length
        })
        
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    try {
      console.log('Attempting sign in with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Sign in result:', { data, error })
      
      if (error) {
        console.error('Sign in error:', error)
        toast.error(`Sign in failed: ${error.message}`)
      } else {
        console.log('Sign in successful:', data)
        toast.success('Signed in successfully!')
      }
    } catch (error: any) {
      console.error('Sign in exception:', error)
      toast.error(`Sign in exception: ${error.message}`)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        toast.error(`Sign out failed: ${error.message}`)
      } else {
        console.log('Sign out successful')
        toast.success('Signed out successfully!')
      }
    } catch (error: any) {
      console.error('Sign out exception:', error)
      toast.error(`Sign out exception: ${error.message}`)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      console.log('Supabase test result:', data)
      toast.success('Supabase connection test completed - check console')
    } catch (error: any) {
      console.error('Supabase test error:', error)
      toast.error(`Supabase test failed: ${error.message}`)
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Debug Page</h1>
      
      {/* Current Auth State */}
      <Card>
        <CardHeader>
          <CardTitle>Current Authentication State</CardTitle>
          <CardDescription>Debug information about the current session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Session:</strong> {session ? 'Active' : 'None'}
          </div>
          <div>
            <strong>User:</strong> {user ? user.email : 'Not logged in'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Session expires at:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Browser and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Test Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Test Authentication</CardTitle>
          <CardDescription>Try signing in with test credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              type="email"
              placeholder="Test email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Test password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Test Sign In'}
              </Button>
              <Button type="button" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Button type="button" variant="outline" onClick={testSupabaseConnection}>
                Test Supabase
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Console Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
          <CardDescription>Steps to debug the authentication issue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Open browser developer tools (F12)</p>
          <p>2. Go to Console tab</p>
          <p>3. Try signing in and watch for error messages</p>
          <p>4. Check Network tab for failed requests</p>
          <p>5. Look for CORS errors or redirect issues</p>
          <p>6. Compare with working Chrome browser</p>
        </CardContent>
      </Card>
    </div>
  )
}
