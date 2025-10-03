import { useEffect, useRef, useState } from "react";

export const useVoiceGuidance = (enabled: boolean = true) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        if (synthRef.current && synthRef.current.getVoices().length > 0) {
          setVoicesLoaded(true);
        }
      };

      // Load voices immediately if available
      loadVoices();
      
      // Listen for voices loaded event
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    }
  }, []);

  const speak = (text: string, rate: number = 1.0) => {
    if (!enabled || !synthRef.current) {
      console.log('Voice guidance disabled or not available');
      return;
    }

    console.log('Speaking:', text);

    // Cancel any current speech and wait for it to stop
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      // Wait longer for cancellation to complete
      setTimeout(() => {
        performSpeak(text, rate);
      }, 300);
    } else {
      performSpeak(text, rate);
    }
  };

  const performSpeak = (text: string, rate: number) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to use a calming voice (only if voices are loaded)
    if (voicesLoaded) {
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Female") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.name.includes("Google") ||
          voice.name.includes("Alex") ||
          voice.name.includes("Daniel") ||
          voice.name.includes("Microsoft")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }
    }

    // Add event listeners to track completion
    utterance.onstart = () => {
      console.log('Speech started:', text);
    };

    utterance.onend = () => {
      console.log('Speech ended:', text);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error, 'Text:', text);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return { speak, cancel };
};
