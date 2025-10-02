import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PremiumUpgradeProps {
  onClose?: () => void;
}

export const PremiumUpgrade = ({ onClose }: PremiumUpgradeProps) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile to premium
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', profile?.id);

      if (error) throw error;

      // Refresh profile to get updated data
      await refreshProfile();

      toast({
        title: "Welcome to Premium! 🎉",
        description: "You now have access to all premium features with no ads.",
      });

      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {loading ? "Processing..." : "Upgrade Now"}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-center text-muted-foreground">
            This is a demo upgrade. In production, this would integrate with Stripe or RevenueCat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
