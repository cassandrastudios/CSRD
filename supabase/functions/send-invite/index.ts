import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, organizationName, inviterName } = await req.json()

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Email and role are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate invite token
    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store invite in database
    const { error: dbError } = await supabase
      .from('team_invites')
      .insert({
        email,
        role,
        token: inviteToken,
        expires_at: expiresAt.toISOString(),
        organization_name: organizationName || 'Your Organization',
        inviter_name: inviterName || 'Team Admin'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create invite' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Resend (you'll need to set up Resend API key)
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join ${organizationName || 'our team'}!</h2>
        <p>Hello,</p>
        <p>${inviterName || 'A team member'} has invited you to join ${organizationName || 'our organization'} on CSRD Co-Pilot as a <strong>${role}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What is CSRD Co-Pilot?</h3>
          <p>CSRD Co-Pilot helps organizations navigate the Corporate Sustainability Reporting Directive (CSRD) compliance journey with AI-powered recommendations and progress tracking.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:9191'}/accept-invite?token=${inviteToken}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </div>

        <p><strong>This invitation will expire in 7 days.</strong></p>
        
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This invitation was sent by ${inviterName || 'a team member'} from ${organizationName || 'your organization'}.
        </p>
      </div>
    `

    // For now, we'll use a simple email service
    // In production, you'd use Resend, SendGrid, or similar
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CSRD Co-Pilot <noreply@csrd-copilot.com>',
        to: [email],
        subject: `You're invited to join ${organizationName || 'our team'} on CSRD Co-Pilot`,
        html: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      console.error('Email sending failed:', await emailResponse.text())
      // Don't fail the request if email fails, just log it
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        inviteToken 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
