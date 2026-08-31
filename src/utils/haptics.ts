import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// sound.ts'in kendi MUTE_KEY'iyle aynı localStorage anahtarı — kullanıcı
// için tek bir "geri bildirim" açma/kapama beklentisi ("Ses efektleri"
// ayarı hem sesi hem titreşimi kontrol ediyor). sound.ts'ten import
// EDİLMİYOR (sound.ts bu modülü kullanacağı için döngüsel import olurdu),
// bu yüzden anahtar burada bilerek küçük bir kopya olarak tutuluyor.
const MUTE_KEY = "mulakat-provasi-muted";

function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

// Yalnızca native (Android/iOS) platformda titreşim veriyor — web'de
// @capacitor/haptics'in navigator.vibrate fallback'i masaüstünde anlamsız,
// bu yüzden bilerek atlanıyor.
function enabled(): boolean {
  return Capacitor.isNativePlatform() && !isMuted();
}

export function hapticSuccess(): void {
  if (!enabled()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export function hapticError(): void {
  if (!enabled()) return;
  Haptics.notification({ type: NotificationType.Error }).catch(() => {});
}

export function hapticLight(): void {
  if (!enabled()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

export function hapticMedium(): void {
  if (!enabled()) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}
