import { useEffect, useState } from "react";
import { isSpeechSupported, speak, stopSpeaking } from "../utils/speech";

// Soru metnini sesli okutan küçük, tekrar kullanılabilir bir düğme. Tarayıcı
// desteklemiyorsa (Web Speech API yoksa) hiçbir şey render etmiyor.
export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    setSpeaking(false);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      className={`speak-btn${speaking ? " speak-btn--active" : ""} ${className}`}
      onClick={toggle}
      aria-label={speaking ? "Sesli okumayı durdur" : "Soruyu sesli oku"}
      aria-pressed={speaking}
    >
      {speaking ? "⏸" : "🔊"}
    </button>
  );
}
