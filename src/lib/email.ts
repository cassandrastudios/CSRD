// Email service for sending stakeholder invitations
// This is a stub implementation - in production, you'd use a service like SendGrid, Resend, or AWS SES

export interface InviteEmailData {
  email: string;
  role: string;
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: string;
}

export async function sendStakeholderInvite(
  data: InviteEmailData
): Promise<boolean> {
  try {
    // In production, this would send an actual email
    console.log('📧 Sending stakeholder invitation:', {
      to: data.email,
      role: data.role,
      organization: data.organizationName,
      inviteUrl: data.inviteUrl,
    });

    // For now, just log the invitation details
    // In production, you would:
    // 1. Use an email service like SendGrid, Resend, or AWS SES
    // 2. Create a proper HTML email template
    // 3. Handle email delivery status and bounces
    // 4. Add retry logic for failed sends

    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}

export function generateInviteUrl(token: string): string {
  // In production, this would use your actual domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9191';
  return `${baseUrl}/invite/${token}`;
}

export function generateEmailTemplate(data: InviteEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>You're invited to join ${data.organizationName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8fafc; padding: 30px; border-radius: 8px;">
        <h1 style="color: #1e40af; margin-bottom: 20px;">
          You're invited to join ${data.organizationName}
        </h1>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi there!
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${data.inviterName} has invited you to join <strong>${data.organizationName}</strong> 
          as a <strong>${data.role}</strong> on the CSRD Co-Pilot platform.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">What you'll be able to do:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${
              data.role === 'admin'
                ? `
              <li>Full access to all areas and features</li>
              <li>Manage all stakeholders and their permissions</li>
              <li>Configure organization settings</li>
            `
                : data.role === 'manager'
                  ? `
              <li>Access to assigned areas with full control</li>
              <li>Invite and manage contributors</li>
              <li>Create and edit content in your areas</li>
            `
                  : `
              <li>Access to assigned areas for editing</li>
              <li>Create and edit content in your areas</li>
              <li>Collaborate with your team</li>
            `
            }
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.inviteUrl}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This invitation will expire on ${new Date(data.expiresAt).toLocaleDateString()}.
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          CSRD Co-Pilot - Streamlining CSRD Reporting
        </p>
      </div>
    </body>
    </html>
  `;
}
