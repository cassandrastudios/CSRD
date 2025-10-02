import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  const handleUpgradeToPremium = () => {
    navigate("/premium");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Display Name</p>
                <p className="font-medium">{profile?.display_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {profile?.is_premium ? (
                    <>
                      <Crown className="h-4 w-4 text-premium" />
                      <span className="font-medium text-premium">Premium</span>
                    </>
                  ) : (
                    <span className="font-medium">Free</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {!profile?.is_premium && (
            <Card className="border-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-premium" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription>
                  Remove ads and unlock all features for a one-time payment of $4.99
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleUpgradeToPremium} className="w-full">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Sign out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
