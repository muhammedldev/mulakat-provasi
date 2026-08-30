import { motion } from "framer-motion";
import Tilt3D from "./Tilt3D";
import { playClick } from "../utils/sound";

interface ModeCard {
  id: "classic" | "terms" | "rapid";
  icon: string;
  title: string;
  desc: string;
  meta: string;
  color: string;
  colorDark: string;
}

const modes: ModeCard[] = [
  {
    id: "classic",
    icon: "🎭",
    title: "Klasik Mülakat",
    desc: "3 mülakatçı, 3 bölüm, hikâyeli bir mülakat provası. Kolaydan zora artan sorular.",
    meta: "~8-9 dakika",
    color: "#3b82f6",
    colorDark: "#1d4ed8",
  },
  {
    id: "terms",
    icon: "🔮",
    title: "Terim Küresi",
    desc: "Küreden terim çek, İK ve iş dünyası kavramlarını öğren. Süre yok, baskı yok.",
    meta: "~5 dakika · Öğrenme modu",
    color: "#14b8a6",
    colorDark: "#0f766e",
  },
  {
    id: "rapid",
    icon: "⚡",
    title: "Seri Mülakat",
    desc: "Karışık sorular, azalan süre. Baskı altında sakin kalmayı test et.",
    meta: "~5-6 dakika · Tryhard",
    color: "#ef4444",
    colorDark: "#b91c1c",
  },
];

export default function ModeSelectScreen({
  onSelect,
  onBack,
}: {
  onSelect: (mode: "classic" | "terms" | "rapid") => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="screen mode-select-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="intro-badge">🎮 Mod Seç</div>
      <h1>Nasıl oynamak istersin?</h1>

      <div className="skill-path">
        <div className="skill-path-line" aria-hidden="true" />
        {modes.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            className={`skill-path-row skill-path-row--${i % 2 === 0 ? "left" : "right"}`}
            onClick={() => {
              playClick();
              onSelect(m.id);
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          >
            <Tilt3D
              className="skill-node"
              style={{
                background: `radial-gradient(circle at 32% 28%, ${m.color}, ${m.colorDark})`,
                boxShadow: `0 8px 0 ${m.colorDark}, 0 16px 26px -8px ${m.colorDark}aa`,
              }}
            >
              <span className="skill-node-icon">{m.icon}</span>
            </Tilt3D>
            <div className="skill-path-info">
              <p className="mode-card-title" style={{ color: m.color }}>
                {m.title}
              </p>
              <p className="mode-card-desc">{m.desc}</p>
              <p className="mode-card-meta">{m.meta}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <button className="btn btn-secondary menu-back-btn" onClick={onBack}>
        ← Ana Menü
      </button>
    </motion.div>
  );
}
