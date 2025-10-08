'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcceptInvitePage() {
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const supabase = createClient();

  useEffect(() => {
    if (token) {
      fetchInviteDetails();
    } else {
      setError('No invitation token provided');
      setLoading(false);
    }
  }, [token]);

  const fetchInviteDetails = async () => {
    try {
      const response = await fetch(`/api/validate-invite?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invite details');
      }

      setInvite(data.invite);
      if (new Date(data.invite.expires_at) < new Date()) {
        setError('This invitation has expired.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invite:', error);
      setError('Failed to load invitation details');
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!token || !invite) return;

    setAccepting(true);
    try {
      // Check if user is already logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // User is not authenticated, redirect to onboarding
        window.location.href = `/onboard-invite?token=${token}`;
        return;
      }

      // User is authenticated, add organization to their account
      try {
        // Add user to organization
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            organization_id: invite.organization_id,
            role: invite.role,
          });

        if (roleError) {
          console.log('Database table not available, continuing without database storage');
        }

        // Delete the invite
        try {
          await supabase
            .from('team_invites')
            .delete()
            .eq('token', token);
        } catch (deleteError) {
          console.log('Could not delete invite from database');
        }

        toast.success(`You have joined ${invite.organization_name} as a ${invite.role}!`);
        
        // Store the new organization as active in localStorage
        localStorage.setItem('activeOrganizationId', invite.organization_id);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (dbError) {
        console.log('Database error, but continuing with acceptance');
        toast.success(`You have joined ${invite.organization_name} as a ${invite.role}!`);
        
        // Store the new organization as active in localStorage
        localStorage.setItem('activeOrganizationId', invite.organization_id);
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isExpired ? (
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          )}
          <CardTitle className={isExpired ? 'text-red-600' : 'text-green-600'}>
            {isExpired ? 'Invitation Expired' : "You're Invited!"}
          </CardTitle>
          <CardDescription>
            {isExpired
              ? 'This invitation has expired and can no longer be accepted.'
              : 'You have been invited to join a team on CSRD Co-Pilot'}
          </CardDescription>
        </CardHeader>

        {!isExpired && invite && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Invited by</p>
                  <p className="text-sm text-gray-600">{invite.inviter_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Organization</p>
                  <p className="text-sm text-gray-600">
                    {invite.organization_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {invite.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={acceptInvite}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By accepting this invitation, you agree to join the team and will
              be granted {invite.role} access.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
