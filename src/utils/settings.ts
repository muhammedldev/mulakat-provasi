import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export type ThemeChoice = "system" | "light" | "dark";
export type FontScale = "normal" | "large";

const THEME_KEY = "mulakat-provasi-theme";
const FONT_SCALE_KEY = "mulakat-provasi-font-scale";
const REDUCED_MOTION_KEY = "mulakat-provasi-reduced-motion";
const REMINDER_KEY = "mulakat-provasi-daily-reminder";

// Uygulamanın kendi tema rengiyle eşleşmesi için native (Android/iOS) durum
// çubuğunu senkronize eder — aksi halde koyu temada bile üstte varsayılan
// açık renkli sistem durum çubuğu kalır.
function syncNativeStatusBar(isDark: boolean): void {
  if (!Capacitor.isNativePlatform()) return;
  StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: isDark ? "#0a1220" : "#eaf0fb" }).catch(() => {});
}

export function getTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function setTheme(theme: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  applySettings();
}

export function getFontScale(): FontScale {
  try {
    return localStorage.getItem(FONT_SCALE_KEY) === "large" ? "large" : "normal";
  } catch {
    return "normal";
  }
}

export function setFontScale(scale: FontScale): void {
  try {
    localStorage.setItem(FONT_SCALE_KEY, scale);
  } catch {
    /* ignore */
  }
  applySettings();
}

export function getReducedMotion(): boolean {
  try {
    return localStorage.getItem(REDUCED_MOTION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setReducedMotion(value: boolean): void {
  try {
    localStorage.setItem(REDUCED_MOTION_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  applySettings();
}

// Ham bayrak — izin isteme/bildirim planlama gibi asenkron yan etkiler
// (bkz. `utils/notifications.ts`) burada değil, çağıran tarafta (SettingsModal,
// `recordDailyPlay()`) yönetiliyor; bu diğer ayarlarla tutarlı, senkron kalıyor.
export function getReminderEnabled(): boolean {
  try {
    return localStorage.getItem(REMINDER_KEY) === "1";
  } catch {
    return false;
  }
}

export function setReminderEnabled(value: boolean): void {
  try {
    localStorage.setItem(REMINDER_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function applySettings(): void {
  const root = document.documentElement;
  const theme = getTheme();
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);

  root.setAttribute("data-font-scale", getFontScale());
  root.setAttribute("data-reduced-motion", getReducedMotion() ? "true" : "false");

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  syncNativeStatusBar(isDark);
}

// "Sistem" tema seçiliyken, uygulama açıkken işletim sistemi temasının
// değişmesi CSS tarafında @media sorgusuyla otomatik yansır ama native durum
// çubuğu JS tarafından ayrıca senkronize edilmesi gerekir.
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getTheme() === "system") applySettings();
  });
}
