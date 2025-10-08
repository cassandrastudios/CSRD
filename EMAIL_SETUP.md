# Email Setup for Team Invitations

To enable real email sending for team invitations, you have several options:

## Option 1: Resend (Recommended - Easy Setup)

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get API Key**: Copy your API key from the dashboard
3. **Add to Environment**: Add to your `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
4. **Update API Route**: Uncomment the email sending code in `/src/app/api/invite-member/route.ts`

## Option 2: SendGrid

1. **Sign up for SendGrid**: Go to [sendgrid.com](https://sendgrid.com)
2. **Get API Key**: Create an API key in your SendGrid dashboard
3. **Add to Environment**: Add to your `.env.local`:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```
4. **Update API Route**: Replace the Resend code with SendGrid code

## Option 3: Nodemailer (SMTP)

1. **Get SMTP credentials** from your email provider (Gmail, Outlook, etc.)
2. **Add to Environment**: Add to your `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
3. **Install Nodemailer**: `npm install nodemailer @types/nodemailer`
4. **Update API Route**: Add Nodemailer code

## Option 4: Supabase Edge Functions (Advanced)

1. **Deploy Edge Function**: The function is already created in `/supabase/functions/send-invite/`
2. **Set up Resend**: Add `RESEND_API_KEY` to your Supabase project secrets
3. **Deploy**: Run `supabase functions deploy send-invite`
4. **Update Frontend**: Call the Edge Function instead of the API route

## Current Status

Right now, the system:
- ✅ Creates invite records in the database
- ✅ Shows pending invites in the UI
- ✅ Handles expiration (7 days)
- ❌ **Does NOT send actual emails** (simulation only)

## Quick Test Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Add your API key to `.env.local`:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
3. Uncomment the email code in `/src/app/api/invite-member/route.ts`
4. Test by sending an invite!

## Email Template

The email includes:
- Professional HTML template
- Invitation link with token
- Role information
- 7-day expiration notice
- Organization branding

## Database

The system stores invites in the `team_invites` table with:
- Email address
- Role assignment
- Unique token
- Expiration date
- Organization info
- Inviter details
