import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdMob, AdOptions } from '@capacitor-community/admob';

interface AdMobProps {
  adId: string;
  size?: string;
  position?: string;
  className?: string;
}

const AdMobComponent = ({ 
  adId, 
  size = "BANNER", 
  position = "BOTTOM_CENTER",
  className = ""
}: AdMobProps) => {
  const { profile } = useAuth();
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Only show ads for non-premium users
    if (!profile?.is_premium) {
      initializeAdMob();
    }
  }, [profile?.is_premium]);

  const initializeAdMob = async () => {
    try {
      // Initialize AdMob
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['YOUR_DEVICE_ID'], // Add your device ID for testing
        initializeForTesting: true, // Set to false for production
      });

      // Show banner ad
      const options: AdOptions = {
        adId: adId,
        adSize: size as any,
        position: position as any,
        margin: 0,
        isTesting: true, // Set to false for production
      };

      await AdMob.showBanner(options);
      setIsAdLoaded(true);
    } catch (error) {
      console.error('AdMob error:', error);
    }
  };

  // Don't show ads for premium users
  if (profile?.is_premium) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      {isAdLoaded && (
        <div className="text-xs text-center text-muted-foreground p-2">
          Advertisement
        </div>
      )}
    </div>
  );
};

export default AdMobComponent;
