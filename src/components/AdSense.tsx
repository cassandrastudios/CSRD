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
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [profile?.is_premium]);

  // Don't show ads for premium users
  if (profile?.is_premium) {
    return null;
  }

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSense;
