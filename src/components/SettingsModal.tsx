import { useState } from "react";
import Modal from "./Modal";
import { isMuted, setMuted, playClick } from "../utils/sound";
import { isMusicEnabled, setMusicEnabled } from "../utils/music";
import { resetProgress } from "../utils/storage";
import {
  getFontScale,
  getReducedMotion,
  getTheme,
  setFontScale,
  setReducedMotion,
  setTheme,
  type FontScale,
  type ThemeChoice,
} from "../utils/settings";

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Sistem" },
  { value: "light", label: "Açık" },
  { value: "dark", label: "Koyu" },
];

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [muted, setMutedState] = useState(isMuted);
  const [musicOn, setMusicOnState] = useState(isMusicEnabled);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [theme, setThemeState] = useState<ThemeChoice>(getTheme);
  const [fontScale, setFontScaleState] = useState<FontScale>(getFontScale);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(getReducedMotion);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClick();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicEnabled(next);
    setMusicOnState(next);
    playClick();
  };

  const chooseTheme = (value: ThemeChoice) => {
    setTheme(value);
    setThemeState(value);
  };

  const toggleFontScale = () => {
    const next: FontScale = fontScale === "normal" ? "large" : "normal";
    setFontScale(next);
    setFontScaleState(next);
  };

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    setReducedMotionState(next);
  };

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetProgress();
    setConfirmingReset(false);
    onClose();
  };

  return (
    <Modal title="⚙️ Ayarlar" onClose={onClose}>
      <div className="settings-row">
        <span>Ses efektleri</span>
        <button className="settings-switch" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? "Kapalı 🔇" : "Açık 🔊"}
        </button>
      </div>

      <div className="settings-row">
        <span>Arka plan müziği</span>
        <button className="settings-switch" onClick={toggleMusic} aria-pressed={musicOn}>
          {musicOn ? "Açık 🎵" : "Kapalı"}
        </button>
      </div>

      <div className="settings-row settings-row--column">
        <span>Tema</span>
        <div className="settings-segmented">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              className={`settings-segment ${theme === opt.value ? "settings-segment--active" : ""}`}
              onClick={() => chooseTheme(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <span>Büyük yazı</span>
        <button className="settings-switch" onClick={toggleFontScale} aria-pressed={fontScale === "large"}>
          {fontScale === "large" ? "Açık" : "Kapalı"}
        </button>
      </div>

      <div className="settings-row">
        <span>Azaltılmış hareket</span>
        <button className="settings-switch" onClick={toggleReducedMotion} aria-pressed={reducedMotion}>
          {reducedMotion ? "Açık" : "Kapalı"}
        </button>
      </div>

      <div className="settings-row">
        <span>İlerlemeyi sıfırla</span>
        <button className={`btn ${confirmingReset ? "btn-danger" : "btn-secondary"}`} onClick={handleReset}>
          {confirmingReset ? "Emin misin? Tekrar tıkla" : "Sıfırla"}
        </button>
      </div>
      <p className="settings-note">
        En iyi skorun, başarımların ve oyun istatistiklerin yalnızca bu cihazda tutulur. Sıfırlama
        işlemi geri alınamaz.
      </p>
    </Modal>
  );
}
