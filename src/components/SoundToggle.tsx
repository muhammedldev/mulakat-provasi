import { useState } from "react";
import { isMuted, setMuted, playClick } from "../utils/sound";

export default function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClick();
  };

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={muted ? "Sesi aç" : "Sesi kapat"}
      title={muted ? "Sesi aç" : "Sesi kapat"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
