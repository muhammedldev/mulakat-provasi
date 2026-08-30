export type ThemeChoice = "system" | "light" | "dark";
export type FontScale = "normal" | "large";

const THEME_KEY = "mulakat-provasi-theme";
const FONT_SCALE_KEY = "mulakat-provasi-font-scale";
const REDUCED_MOTION_KEY = "mulakat-provasi-reduced-motion";

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

export function applySettings(): void {
  const root = document.documentElement;
  const theme = getTheme();
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);

  root.setAttribute("data-font-scale", getFontScale());
  root.setAttribute("data-reduced-motion", getReducedMotion() ? "true" : "false");
}
