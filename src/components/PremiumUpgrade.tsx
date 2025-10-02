import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StripePayment } from "./StripePayment";
import { MobilePayment } from "./MobilePayment";

interface PremiumUpgradeProps {
  onClose?: () => void;
}

export const PremiumUpgrade = ({ onClose }: PremiumUpgradeProps) => {
  const [showPayment, setShowPayment] = useState(false);
  
  // Detect if running in mobile app (Capacitor)
  const isMobileApp = window.location.protocol === 'capacitor:' || 
                     window.navigator.userAgent.includes('CapacitorApp');

  const handleUpgrade = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (onClose) onClose();
  };

  const features = [
    "Remove all advertisements",
    "Advanced training programs",
    "Detailed progress analytics",
    "Export your training data",
    "Priority customer support",
    "Unlimited custom tables",
  ];

  if (showPayment) {
    return isMobileApp ? (
      <MobilePayment onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
    ) : (
      <StripePayment onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            Unlock all features and remove ads for just $4.99
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

          {/* Platform-specific payment method */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {isMobileApp ? 
                "💳 Secure in-app purchase via App Store/Play Store" :
                "💳 Secure payment powered by Stripe"
              }
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
