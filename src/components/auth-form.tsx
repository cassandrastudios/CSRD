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
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          throw error
        }
        toast.success('Signed in successfully!')
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) {
          throw error
        }
        
        toast.success('Check your email for verification link!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      // For embedded browsers, open OAuth in a new window
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Force opening in new window for embedded browsers
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        throw error
      } else {
        toast.success('Google authentication initiated!')
        // For embedded browsers, we need to handle the redirect differently
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch (error: any) {
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
                
                {/* Quick test login for embedded browsers */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">
                    Having trouble with embedded browser? Try this test account:
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setEmail('test@example.com')
                      setPassword('testpassword123')
                      setLoading(true)
                      try {
                        const { error } = await supabase.auth.signInWithPassword({
                          email: 'test@example.com',
                          password: 'testpassword123',
                        })
                        if (error) {
                          // If test user doesn't exist, create it
                          const { error: signUpError } = await supabase.auth.signUp({
                            email: 'test@example.com',
                            password: 'testpassword123',
                          })
                          if (signUpError) {
                            throw signUpError
                          }
                          toast.success('Test account created! Please check your email.')
                        } else {
                          toast.success('Signed in with test account!')
                          setTimeout(() => {
                            window.location.href = '/dashboard'
                          }, 500)
                        }
                      } catch (error: any) {
                        toast.error('Test login failed: ' + error.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    Use Test Account
                  </Button>
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
