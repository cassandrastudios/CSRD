import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QrINAGDcP3S0m8JMtXTE2IJ2ftqOheZZlZ9gnov0vyWn1YlTJ09ZcBuWVpCqTZ7cQI9Hous55VSky3sBo2wKBQe00UZGNrUdB';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Create payment intent (this would normally be on your backend)
export const createPaymentIntent = async (amount: number) => {
  try {
    // For now, we'll simulate this since we don't have a backend
    // In production, this should call your backend API
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'usd',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    // Fallback: simulate payment for demo
    console.log('Using demo payment simulation');
    return {
      client_secret: 'pi_demo_client_secret',
      amount: amount,
    };
  }
};
