'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import toast from 'react-hot-toast'

export function AuthForm() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome to CSRD Co-Pilot</CardTitle>
        <CardDescription>
          Sign in to access your CSRD compliance dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                }
              }
            }
          }}
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`}
        />
      </CardContent>
    </Card>
  )
}
