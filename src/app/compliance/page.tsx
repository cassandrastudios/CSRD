import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ComplianceCheck } from '@/components/compliance-check';

export default async function CompliancePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <ComplianceCheck />;
}
