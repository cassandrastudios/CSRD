import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Bluetooth, 
  BookOpen, 
  Info,
  User,
  Palette,
  Globe,
  Bell,
  Shield,
  Heart,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type SettingsView = 'settings' | 'integrations' | 'tips' | 'about';

const SettingsMore = () => {
  const [currentView, setCurrentView] = useState<SettingsView>('settings');
  const { profile, signOut } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    displayName: profile?.display_name || '',
    theme: 'dark',
    units: 'seconds',
    language: 'en',
    notifications: true,
    voiceGuidance: true,
    hapticFeedback: true,
    autoStart: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-foreground mb-2">
          Settings & More
        </h1>
        <p className="text-muted-foreground">
          Customize your experience and learn more about AERO
        </p>
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as SettingsView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="tips">How to Practice</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    placeholder="Enter your name"
                  />
                </div>
                <Button className="w-full">Save Profile</Button>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Units</label>
                    <p className="text-xs text-muted-foreground">Time display format</p>
                  </div>
                  <select
                    value={settings.units}
                    onChange={(e) => handleSettingChange('units', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Training Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Training</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Voice Guidance</label>
                    <p className="text-xs text-muted-foreground">Audio cues during training</p>
                  </div>
                  <Switch
                    checked={settings.voiceGuidance}
                    onCheckedChange={(checked) => handleSettingChange('voiceGuidance', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Haptic Feedback</label>
                    <p className="text-xs text-muted-foreground">Vibration alerts</p>
                  </div>
                  <Switch
                    checked={settings.hapticFeedback}
                    onCheckedChange={(checked) => handleSettingChange('hapticFeedback', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto Start</label>
                    <p className="text-xs text-muted-foreground">Start training immediately</p>
                  </div>
                  <Switch
                    checked={settings.autoStart}
                    onCheckedChange={(checked) => handleSettingChange('autoStart', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Practice Reminders</label>
                    <p className="text-xs text-muted-foreground">Daily training reminders</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bluetooth className="w-6 h-6" />
                <span>Device Integrations</span>
              </CardTitle>
              <CardDescription>
                Connect your devices for enhanced training data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Garmin Devices</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your Garmin watch for accurate heart rate data
                    </p>
                  </div>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Coming Soon:</strong> Integration with popular fitness trackers and smartwatches 
                  for real-time heart rate monitoring during breath-hold training.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Training Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">✅ Proper Breathing</h4>
                    <p className="text-sm text-green-700">
                      Focus on slow, deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">⏰ Consistency</h4>
                    <p className="text-sm text-blue-700">
                      Practice daily, even if just for 10-15 minutes. Consistency beats intensity.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">⚠️ Safety First</h4>
                    <p className="text-sm text-yellow-700">
                      Never practice in water alone. Always have a buddy when training in water.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Techniques</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">🫁 CO2 Tolerance</h4>
                    <p className="text-sm text-purple-700">
                      CO2 tables help build tolerance to carbon dioxide buildup in your blood.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800">💨 O2 Deprivation</h4>
                    <p className="text-sm text-orange-700">
                      O2 tables train your body to use oxygen more efficiently.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800">🚨 Warning Signs</h4>
                    <p className="text-sm text-red-700">
                      Stop immediately if you feel dizzy, nauseous, or lose consciousness.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-6 h-6" />
                <span>About AERO</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">AERO</div>
                <p className="text-lg text-muted-foreground mb-4">
                  Advanced Breath-Hold Training Platform
                </p>
                <p className="text-sm text-muted-foreground">
                  Version 1.0.0
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Mission</h4>
                <p className="text-sm text-muted-foreground">
                  AERO empowers freedivers, spearfishers, and breath-hold enthusiasts with 
                  professional training tools, progress tracking, and safety guidance.
                </p>

                <h4 className="font-medium">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• O2 and CO2 training tables</li>
                  <li>• Custom table builder</li>
                  <li>• Progress tracking and statistics</li>
                  <li>• Voice guidance and safety alerts</li>
                  <li>• Cross-platform support (Web, iOS, Android)</li>
                </ul>

                <h4 className="font-medium">Safety</h4>
                <p className="text-sm text-muted-foreground">
                  Always practice breath-hold training safely. Never train alone in water. 
                  Consult with a medical professional before beginning any breath-hold training program.
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  © 2024 AERO. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsMore;
