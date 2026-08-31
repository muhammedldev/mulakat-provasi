// Soruları sesli okuma — tarayıcının yerleşik Web Speech API'si (SpeechSynthesis)
// kullanılıyor, dışarıya hiçbir veri gitmiyor ve ekstra bir bağımlılık gerekmiyor.
// Bazı tarayıcılar (özellikle mobil) Türkçe ses paketini yalnızca kullanıcı
// etkileşiminden sonra veya asenkron olarak yüklüyor; bu yüzden `tr-TR` sesi
// hazır değilse API sessizce varsayılan sese düşüyor (still functional, just
// not guaranteed to sound Turkish on every device).

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

function pickTurkishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang?.toLowerCase().startsWith("tr")) ?? null;
}

export function speak(text: string, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "tr-TR";
  const voice = pickTurkishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    if (currentUtterance === utterance) currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}
