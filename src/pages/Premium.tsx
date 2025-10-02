import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Crown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Premium = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const features = [
    "Remove all ads",
    "Unlimited training sessions",
    "Advanced statistics",
    "Lifetime access",
    "Priority support",
  ];

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // TODO: Integrate Stripe Checkout
      // For now, we'll simulate the payment
      toast({
        title: "Payment Processing",
        description: "Redirecting to payment gateway...",
      });
      
      // This would be replaced with actual Stripe integration
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      // });
      // const { url } = await response.json();
      // window.location.href = url;
      
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

  if (profile?.is_premium) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Premium</h1>
          </div>

          <Card className="border-premium">
            <CardHeader className="text-center">
              <Crown className="h-16 w-16 mx-auto mb-4 text-premium" />
              <CardTitle className="text-2xl">You're Premium!</CardTitle>
              <CardDescription>
                Thank you for supporting Apnea Trainer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-premium" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={() => navigate("/")}>
                Back to Training
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
        </div>

        <Card className="border-premium">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 mx-auto mb-4 text-premium" />
            <CardTitle className="text-3xl">Lifetime Premium</CardTitle>
            <CardDescription className="text-xl mt-2">
              One-time payment of <span className="text-premium font-bold">$4.99</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-premium" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Upgrade Now - $4.99"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Secure payment powered by Stripe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;
