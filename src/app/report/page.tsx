import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReportBuilder } from '@/components/report-builder';

export default async function ReportPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <ReportBuilder />;
}
