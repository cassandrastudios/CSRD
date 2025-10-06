import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpqgmgskcgeornvixwrq.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWdtZ3NrY2dlb3Judml4d3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTEzNzQsImV4cCI6MjA3NDk2NzM3NH0.fDkKP4Nj4dsjx13t8liT9E_4N6uRmJQZ9F1zXbhmVSM',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
