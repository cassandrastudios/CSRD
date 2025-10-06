'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        // Test Supabase connection
        const { data: testData, error: testError } = await supabase
          .from('esrs_topics')
          .select('count')
          .limit(1)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        setDebugInfo({
          url: window.location.href,
          userAgent: navigator.userAgent,
          supabaseConnected: !testError,
          supabaseError: testError?.message,
          user: user ? { id: user.id, email: user.email } : null,
          userError: userError?.message,
          session: session ? 'Active' : 'None',
          sessionError: sessionError?.message,
          cookies: document.cookie,
          localStorage: Object.keys(localStorage).length,
          sessionStorage: Object.keys(sessionStorage).length
        })
      } catch (error: any) {
        setDebugInfo({
          error: error.message,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      } finally {
        setLoading(false)
      }
    }

    gatherDebugInfo()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CSRD Co-Pilot Debug Info</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                url: debugInfo.url,
                userAgent: debugInfo.userAgent,
                cookies: debugInfo.cookies,
                localStorage: debugInfo.localStorage,
                sessionStorage: debugInfo.sessionStorage
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Connected:</strong> {debugInfo.supabaseConnected ? '✅ Yes' : '❌ No'}</p>
              {debugInfo.supabaseError && (
                <p><strong>Error:</strong> {debugInfo.supabaseError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>User:</strong> {debugInfo.user ? `✅ ${debugInfo.user.email}` : '❌ Not logged in'}</p>
              <p><strong>Session:</strong> {debugInfo.session || 'None'}</p>
              {debugInfo.userError && (
                <p><strong>User Error:</strong> {debugInfo.userError}</p>
              )}
              {debugInfo.sessionError && (
                <p><strong>Session Error:</strong> {debugInfo.sessionError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {debugInfo.error && (
          <Card>
            <CardHeader>
              <CardTitle>General Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{debugInfo.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
