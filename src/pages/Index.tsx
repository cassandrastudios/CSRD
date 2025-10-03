import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Train from "@/pages/Train";
import Stats from "@/pages/Stats";
import SettingsMore from "@/pages/SettingsMore";
import AdMob from "@/components/AdMob";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";
import { Crown } from "lucide-react";

type Section = 'train' | 'stats' | 'settings';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>('train');
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-white">AERO</div>
              <div className="text-sm text-blue-200">Breath-Hold Training</div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!profile?.is_premium && (
                <button
                  onClick={() => setShowPremiumUpgrade(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Premium - $4.99</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <Navigation 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />

        {/* AdMob for free users */}
        <AdMob adId="ca-app-pub-3940256099942544/6300978111" />

        {/* Section Content */}
        {currentSection === 'train' && <Train />}
        {currentSection === 'stats' && <Stats />}
        {currentSection === 'settings' && <SettingsMore />}
      </main>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgrade && (
        <PremiumUpgrade onClose={() => setShowPremiumUpgrade(false)} />
      )}
    </div>
  );
};

export default Index;