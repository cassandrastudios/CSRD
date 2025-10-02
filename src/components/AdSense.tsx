import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AdSenseProps {
  slot: string;
  format?: string;
  responsive?: boolean;
}

const AdSense = ({ slot, format = "auto", responsive = true }: AdSenseProps) => {
  const { profile } = useAuth();

  useEffect(() => {
    // Only load ads for non-premium users
    if (!profile?.is_premium) {
      try {
        // Check if ads are already loaded
        const adElement = document.querySelector(`[data-ad-slot="${slot}"]`);
        if (adElement && !adElement.hasAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [profile?.is_premium, slot]);

  // Don't show ads for premium users
  if (profile?.is_premium) {
    return null;
  }

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5631064277537055"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSense;
