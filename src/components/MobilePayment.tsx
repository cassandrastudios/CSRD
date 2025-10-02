import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, Download } from "lucide-react";
import { useRevenueCat } from "@/hooks/useRevenueCat";

interface MobilePaymentProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const MobilePayment = ({ onSuccess, onClose }: MobilePaymentProps) => {
  const { isLoading, purchasePremium, restorePurchases } = useRevenueCat();

  const features = [
    "Remove all advertisements",
    "Advanced training programs",
    "Detailed progress analytics", 
    "Export your training data",
    "Priority customer support",
    "Unlimited custom tables",
  ];

  const handlePurchase = async () => {
    const success = await purchasePremium();
    if (success) {
      onSuccess();
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            Secure in-app purchase via App Store/Play Store
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
            <div className="text-sm text-muted-foreground">One-time purchase</div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {isLoading ? "Processing..." : "Purchase Premium - $4.99"}
          </Button>

          {/* Restore Button */}
          <Button
            onClick={handleRestore}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Restore Purchases
          </Button>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Secure purchase via App Store/Play Store
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
