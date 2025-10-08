import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Settings } from '@/components/settings';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <Settings />;
}
