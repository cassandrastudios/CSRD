import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Stripe publishable key (use test key for sandbox)
const stripePromise = loadStripe("pk_test_51234567890abcdefghijklmnopqrstuvwxyz");

interface StripePaymentProps {
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentForm = ({ onSuccess, onClose }: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create payment intent on your backend
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: 499, currency: 'usd' }
      });

      if (error) throw error;

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Update user to premium
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', profile?.id);

        if (updateError) throw updateError;

        await refreshProfile();

        toast({
          title: "Payment Successful! 🎉",
          description: "Welcome to Premium! You now have access to all features.",
        });

        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {loading ? "Processing..." : "Pay $4.99"}
        </Button>
      </div>
    </form>
  );
};

export const StripePayment = ({ onSuccess, onClose }: StripePaymentProps) => {
  const features = [
    "Remove all advertisements",
    "Advanced training programs", 
    "Detailed progress analytics",
    "Export your training data",
    "Priority customer support",
    "Unlimited custom tables",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            Secure payment powered by Stripe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">$4.99</div>
            <div className="text-sm text-muted-foreground">One-time payment</div>
          </div>

          {/* Stripe Payment Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Your payment is secure and encrypted by Stripe
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
