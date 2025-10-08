'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Check if user has completed onboarding
          try {
            const { data: organizations } = await supabase
              .from('organizations')
              .select('id')
              .limit(1);
            
            if (!organizations || organizations.length === 0) {
              // User needs to complete onboarding
              router.push('/onboarding');
            } else {
              router.push('/dashboard');
            }
          } catch (orgError) {
            console.log('Database not available, redirecting to onboarding');
            // If database is not available, assume user needs onboarding
            router.push('/onboarding');
          }
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If database is not available, assume user needs onboarding
        router.push('/onboarding');
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">CSRD Co-Pilot</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
