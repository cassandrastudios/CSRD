import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DoubleMaterialityAssessmentSimple } from '@/components/double-materiality-assessment-simple';

export default async function MaterialityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <DoubleMaterialityAssessmentSimple />;
}
