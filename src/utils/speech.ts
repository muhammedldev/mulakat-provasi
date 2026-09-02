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

// Elimizdeki Türkçe seslerden en doğal duranı seçmeye çalışıyoruz — ağ
// tabanlı sesler (Google'ın WaveNet motoru, Windows'un "Natural" sesleri gibi)
// genelde cihazın eski/yerel motorundan çok daha az robotik çıkıyor. Cihazda
// tek bir ses kuruluysa (yaygın durum) zaten onu seçeriz, ama birden fazla
// varsa en iyisini otomatik buluruz.
function pickTurkishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("tr"));
  if (voices.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (!v.localService) s += 2;
    if (/natural|online|wavenet|neural|enhanced/i.test(v.name)) s += 2;
    if (v.default) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

export function speak(text: string, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "tr-TR";
  const voice = pickTurkishVoice();
  if (voice) utterance.voice = voice;
  // Varsayılan rate=1/pitch=1 elimizdeki tek sesle (ör. eski nesil "Tolga")
  // ağır ve kalın duruyordu — hafif yukarı çekmek robotik hissi azaltıyor,
  // aşırıya kaçmadan (karikatürize bir ses de kötü, doğal olan hedef).
  utterance.rate = 1.02;
  utterance.pitch = 1.1;
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
