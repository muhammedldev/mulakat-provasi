import { motion } from "framer-motion";
import { sectors } from "../data/sectors";
import { playClick } from "../utils/sound";
import type { SectorId } from "../types";

export default function SectorSelectScreen({
  onSelect,
  onBack,
}: {
  onSelect: (sector?: SectorId) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="screen round-intro-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="intro-badge">🎭 Klasik Mülakat</div>
      <h1>Bir sektöre göre pratik yapmak ister misin?</h1>
      <p className="intro-text">
        Seçtiğin sektöre özel birkaç soru genel havuza karışır — geri kalanı yine aynı, kapsamlı
        mülakat deneyimi.
      </p>

      <div className="sector-select-list">
        <button
          type="button"
          className="sector-select-card"
          onClick={() => {
            playClick();
            onSelect(undefined);
          }}
        >
          <span className="sector-select-icon" aria-hidden="true">
            🎯
          </span>
          <span className="sector-select-info">
            <span className="sector-select-title">Genel</span>
            <span className="sector-select-desc">Sektöre özel içerik olmadan, standart soru havuzu.</span>
          </span>
        </button>

        {sectors.map((s) => (
          <button
            type="button"
            key={s.id}
            className="sector-select-card"
            onClick={() => {
              playClick();
              onSelect(s.id);
            }}
          >
            <span className="sector-select-icon" aria-hidden="true">
              {s.icon}
            </span>
            <span className="sector-select-info">
              <span className="sector-select-title">{s.label}</span>
              <span className="sector-select-desc">{s.description}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-secondary menu-back-btn" onClick={onBack}>
        ← Geri
      </button>
    </motion.div>
  );
}
