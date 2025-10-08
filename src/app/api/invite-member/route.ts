import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend('re_df7Whao2_JNqPYXtJoNJ2CkwniqEtXRhx');

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', user.user_metadata?.organization_id)
      .single();

    // Generate invite token
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invite in database (if table exists)
    try {
      const { error: dbError } = await supabase.from('team_invites').insert({
        email,
        role,
        token: inviteToken,
        expires_at: expiresAt.toISOString(),
        organization_name: organization?.name || 'Your Organization',
        inviter_name:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email,
      });

      if (dbError) {
        console.log(
          'Database table not found, continuing without database storage:',
          dbError.message
        );
        // Continue without database storage for now
      }
    } catch (error) {
      console.log(
        'Database table not available, continuing without database storage'
      );
      // Continue without database storage for now
    }

    // Send email using Resend
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join ${organization?.name || 'our team'}!</h2>
        <p>Hello,</p>
        <p>${user.user_metadata?.display_name || user.user_metadata?.full_name || user.email} has invited you to join ${organization?.name || 'our organization'} on CSRD Co-Pilot as a <strong>${role}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What is CSRD Co-Pilot?</h3>
          <p>CSRD Co-Pilot helps organizations navigate the Corporate Sustainability Reporting Directive (CSRD) compliance journey with AI-powered recommendations and progress tracking.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9191'}/accept-invite?token=${inviteToken}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </div>

        <p><strong>This invitation will expire in 7 days.</strong></p>
        
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This invitation was sent by ${user.user_metadata?.display_name || user.user_metadata?.full_name || user.email} from ${organization?.name || 'your organization'}.
        </p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // Using verified Resend domain
        to: [email],
        subject: `You're invited to join ${organization?.name || 'our team'} on CSRD Co-Pilot`,
        html: emailContent,
      });

      if (error) {
        console.error('Email sending failed:', error);
        // Don't fail the request if email fails, just log it
      } else {
        console.log('Email sent successfully to:', email, 'ID:', data?.id);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      inviteToken,
    });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
