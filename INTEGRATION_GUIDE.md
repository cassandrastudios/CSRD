# Apnea Trainer - Integration Guide

## Overview
This is a production-ready apnea training web application built with React, TypeScript, Vite, and Lovable Cloud (Supabase).

## Features Implemented
✅ Authentication (Email/Password + Google Sign-In)
✅ Training Sessions (O2, CO2, Custom, Programs)
✅ Voice Guidance (Web Speech Synthesis API)
✅ Session History & Statistics
✅ Streaks Tracking
✅ Personal Bests
✅ Premium/Free User System
✅ AdSense Integration (ready)
✅ PWA Support
✅ Responsive Design

## Pending Integrations

### 1. Google AdSense Setup

**What's already done:**
- AdSense component created (`src/components/AdSense.tsx`)
- Conditional rendering (only shows for free users)
- Two ad slots integrated in the dashboard

**What you need to do:**
1. Sign up for Google AdSense: https://www.google.com/adsense
2. Get your Publisher ID (starts with `ca-pub-`)
3. Update `src/components/AdSense.tsx`:
   ```typescript
   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your ID
   ```
4. Add the AdSense script to `index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
   ```

### 2. Stripe Payment Integration

**What's already done:**
- Premium page UI (`src/pages/Premium.tsx`)
- Database field `is_premium` in profiles table
- Premium/Free user logic throughout the app

**What you need to do:**

#### Option A: Use Lovable's Stripe Integration (Recommended)
Lovable has a built-in Stripe integration tool. Ask Lovable to enable it:
```
"Enable Stripe integration for premium subscriptions"
```

#### Option B: Manual Stripe Setup
1. Create a Stripe account: https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create an Edge Function for Stripe Checkout:

```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string)

Deno.serve(async (req) => {
  const { userId } = await req.json()
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Apnea Trainer Premium',
            description: 'Lifetime access to premium features',
          },
          unit_amount: 499, // $4.99 in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.headers.get('origin')}/premium?success=true`,
    cancel_url: `${req.headers.get('origin')}/premium?canceled=true`,
    metadata: {
      userId,
    },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

4. Create a webhook handler for payment confirmation:

```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata.userId

    // Update user to premium
    await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

5. Update `src/pages/Premium.tsx` to call your checkout function:

```typescript
const handleCheckout = async () => {
  setLoading(true);
  
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { userId: user?.id }
    });
    
    if (error) throw error;
    
    window.location.href = data.url;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to process payment. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

### 3. Google OAuth Configuration

**What's already done:**
- Google Sign-In button in Auth page
- OAuth flow implementation

**What you need to do:**
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins and redirect URIs
6. Configure in Lovable Cloud:
   - Open Backend (Cloud dashboard)
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your Client ID and Client Secret

### 4. PWA Icons

**What's done:**
- `manifest.json` created
- PWA configuration ready

**What you need:**
Replace placeholder icons with actual app icons:
1. Create icons in sizes: 192x192, 512x512
2. Replace `/placeholder.svg` references in `public/manifest.json`
3. Add icons to `/public/` folder

### 5. Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables (will be auto-populated from Lovable Cloud)
4. Deploy!

## Database Schema

The app uses these tables in Lovable Cloud:

- `profiles` - User profiles with premium status
- `sessions` - Training session records
- `streaks` - User streak tracking
- `personal_bests` - Personal best hold times

All tables have Row Level Security (RLS) policies enabled.

## Authentication Flow

1. User signs up/signs in via Email or Google
2. Profile automatically created via trigger
3. Streak and personal_best records initialized
4. User can start training immediately

## Premium Features

Free users see:
- Ads on dashboard and other pages
- All training features
- Limited history (last 50 sessions)

Premium users get:
- Ad-free experience
- Unlimited session history
- Priority support
- Lifetime access for $4.99

## Voice Guidance

Uses Web Speech Synthesis API (browser built-in):
- No API keys needed
- Works offline
- Calming voice prompts during training
- Can be toggled on/off

## Offline Support

The app works offline as a PWA:
- Training sessions work without internet
- Sessions sync when connection restored
- Service worker caches app shell

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.5+)
- Opera: Full support

## Support & Documentation

- Lovable Cloud Dashboard: View Backend in settings
- Database: Managed automatically
- Authentication: Configured in Cloud dashboard

## Next Steps

1. Set up Google AdSense
2. Configure Stripe payments
3. Set up Google OAuth
4. Replace PWA icons
5. Deploy to Vercel
6. Test end-to-end flows

## Notes

- All colors use HSL values from the design system
- Ocean-inspired theme with calm UI/UX
- Mobile-first responsive design
- Optimized for PWA performance
