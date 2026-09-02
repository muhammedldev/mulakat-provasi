import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

// Soruları sesli okuma. Web'de tarayıcının yerleşik Web Speech API'si
// (SpeechSynthesis) kullanılıyor. Android'de bu API Capacitor'ın sardığı
// WebView'de hiç mevcut değil (`"speechSynthesis" in window` sürekli false
// dönüyor — WebView bileşeni, aynı cihazın normal Chrome'undan farklı olarak
// bu API'yi hiç desteklemiyor, bilinen bir platform kısıtı) — bu yüzden
// native tarafta telefonun kendi TTS motorunu doğrudan çağıran
// @capacitor-community/text-to-speech eklentisini kullanıyoruz. İkisi de
// dışarıya hiçbir veri göndermiyor, cihazın kendi sesini kullanıyor.

export function isSpeechSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let speaking = false;

// Native tarafta hangi ses indeksinin kullanılacağını bir kere hesaplayıp
// önbelleğe alıyoruz — her konuşmada tekrar sorgulamaya gerek yok. `undefined`
// = henüz hesaplanmadı, `null` = uygun ses bulunamadı (motor varsayılanı
// kullanılır).
let cachedNativeVoiceIndex: number | null | undefined;

// Android'in TTS motoru (Google) bir dil için genelde birden fazla ses
// sunuyor: "-local" (cihaz üstü, düşük kalite, kalın/robotik) ve "-network"
// (Google'ın bulut motoru, WaveNet tabanlı, çok daha doğal). Hiçbiri
// `default: true` işaretli olmuyor, motor sessizce local birini seçiyor —
// bu yüzden network olanı elle bulup seçmemiz gerekiyor.
async function pickNativeVoiceIndex(): Promise<number | undefined> {
  if (cachedNativeVoiceIndex !== undefined) return cachedNativeVoiceIndex ?? undefined;
  try {
    const { voices } = await TextToSpeech.getSupportedVoices();
    const trVoices = voices
      .map((v, index) => ({ ...v, index }))
      .filter((v) => v.lang?.toLowerCase().startsWith("tr"));
    if (trVoices.length === 0) {
      cachedNativeVoiceIndex = null;
      return undefined;
    }
    const score = (v: (typeof trVoices)[number]) => (v.localService ? 0 : 2) + (v.default ? 1 : 0);
    const best = [...trVoices].sort((a, b) => score(b) - score(a))[0];
    cachedNativeVoiceIndex = best.index;
    return best.index;
  } catch {
    cachedNativeVoiceIndex = null;
    return undefined;
  }
}

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

  if (Capacitor.isNativePlatform()) {
    speaking = true;
    pickNativeVoiceIndex()
      .then((voice) => TextToSpeech.speak({ text, lang: "tr-TR", rate: 1.02, pitch: 1.1, voice }))
      .catch(() => {
        /* ignore — konuşma başlatılamadıysa sessizce vazgeç */
      })
      .finally(() => {
        speaking = false;
        onEnd?.();
      });
    return;
  }

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
    speaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
  };

  speaking = true;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  speaking = false;
  if (Capacitor.isNativePlatform()) {
    void TextToSpeech.stop();
    return;
  }
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return speaking;
}
