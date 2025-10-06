import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MaterialityAssessmentSimple } from '@/components/materiality-assessment-simple'

export default async function MaterialityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <MaterialityAssessmentSimple />
}
