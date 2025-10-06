'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRedirectButton, setShowRedirectButton] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting authentication:', { isLogin, email, password: '***' })
      console.log('Supabase client:', supabase)
      console.log('Current origin:', window.location.origin)
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log('Sign in result:', { data, error })
        
        if (error) {
          console.error('Sign in error details:', error)
          throw error
        }
        
        console.log('Sign in successful, redirecting to dashboard...')
        toast.success('Signed in successfully!')
        
        // Small delay to ensure session is properly set
        setTimeout(() => {
          console.log('Forcing redirect to /dashboard')
          window.location.href = '/dashboard'
        }, 500)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        console.log('Sign up result:', { data, error })
        
        if (error) {
          console.error('Sign up error details:', error)
          throw error
        }
        
        toast.success('Check your email for verification link!')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name,
        stack: error.stack
      })
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      console.log('Attempting Google OAuth...')
      console.log('Redirect URL:', `${window.location.origin}/dashboard`)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      console.log('Google OAuth result:', { error })
      
      if (error) {
        console.error('Google auth error:', error)
        throw error
      } else {
        console.log('Google OAuth successful, redirecting to dashboard...')
        toast.success('Google authentication successful!')
        // Small delay to ensure session is properly set
        setTimeout(() => {
          console.log('Forcing redirect to /dashboard')
          window.location.href = '/dashboard'
        }, 500)
      }
    } catch (error: any) {
      console.error('Google auth error:', error)
      toast.error(`Google authentication failed: ${error.message}`)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome to CSRD Co-Pilot</CardTitle>
        <CardDescription>
          {isLogin ? 'Sign in to your account' : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
        
        {showRedirectButton && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 mb-2">
              Sign in successful! If you're not redirected automatically:
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
