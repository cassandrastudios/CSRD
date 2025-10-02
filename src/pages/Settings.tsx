import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Bell, Palette, Globe, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    darkMode: true,
    voiceGuidance: true,
    vibration: true,
    units: 'seconds' as 'seconds' | 'minutes',
    language: 'en',
    notifications: true,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    // TODO: Implement premium upgrade flow
    toast({
      title: "Premium Upgrade",
      description: "Premium features coming soon! Stay tuned.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-ocean">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Free Account</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleUpgrade}>
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Training Settings
              </CardTitle>
              <CardDescription>Customize your training experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-guidance">Voice Guidance</Label>
                  <p className="text-sm text-muted-foreground">Audio cues during training</p>
                </div>
                <Switch
                  id="voice-guidance"
                  checked={settings.voiceGuidance}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, voiceGuidance: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vibration">Vibration</Label>
                  <p className="text-sm text-muted-foreground">Haptic feedback on mobile</p>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.vibration}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, vibration: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="units">Time Units</Label>
                  <p className="text-sm text-muted-foreground">Display time in seconds or minutes</p>
                </div>
                <select
                  id="units"
                  value={settings.units}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, units: e.target.value as 'seconds' | 'minutes' }))
                  }
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the app's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get reminders and updates</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <CreditCard className="w-5 h-5" />
                Premium Features
              </CardTitle>
              <CardDescription>Unlock advanced features with Premium</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Premium includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• No advertisements</li>
                  <li>• Advanced training programs</li>
                  <li>• Detailed analytics</li>
                  <li>• Export data</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <Button onClick={handleUpgrade} className="w-full">
                Upgrade to Premium - $4.99
              </Button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};