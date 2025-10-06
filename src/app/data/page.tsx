import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DataHub } from '@/components/data-hub'

export default async function DataPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <DataHub />
}
