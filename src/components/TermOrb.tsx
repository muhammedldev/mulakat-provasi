import { useState } from "react";
import { motion } from "framer-motion";

export default function TermOrb({
  remaining,
  total,
  spinning,
  onDraw,
}: {
  remaining: number;
  total: number;
  spinning: boolean;
  onDraw: () => void;
}) {
  const [flash, setFlash] = useState(0);
  const dots = Array.from({ length: total }, (_, i) => i < remaining);

  const handleClick = () => {
    setFlash((f) => f + 1);
    onDraw();
  };

  return (
    <div className="term-orb-wrap">
      <div className="term-orb-stage">
        {!spinning && remaining > 0 && <span className="term-orb-glow" aria-hidden="true" />}
        {flash > 0 && <span key={flash} className="term-orb-rays" aria-hidden="true" />}
        <motion.button
          className="term-orb"
          onClick={handleClick}
          disabled={spinning || remaining === 0}
          animate={
            spinning
              ? { rotate: [0, -8, 8, -6, 6, 0], scale: [1, 0.94, 1.08, 1.02, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={!spinning && remaining > 0 ? { scale: 1.04 } : {}}
          whileTap={!spinning && remaining > 0 ? { scale: 0.95 } : {}}
          aria-label="Küreden terim çek"
        >
          <svg viewBox="0 0 200 200" className="term-orb-svg">
            <defs>
              <radialGradient id="orbGrad" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="45%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="92" fill="url(#orbGrad)" />
            <ellipse cx="72" cy="62" rx="28" ry="16" fill="#ffffff" opacity="0.35" />
            {dots.map((filled, i) => {
              const angle = (i / total) * Math.PI * 2;
              const r = 58;
              const cx = 100 + Math.cos(angle) * r;
              const cy = 100 + Math.sin(angle) * r;
              return (
                <circle
                  key={i}
                  className="term-orb-dot"
                  cx={cx}
                  cy={cy}
                  r={filled ? 6 : 4.5}
                  fill={filled ? "#fef3c7" : "rgba(255,255,255,0.18)"}
                />
              );
            })}
            <text x="100" y="108" textAnchor="middle" fontSize="30" fill="#fff" fontWeight="700">
              {remaining}
            </text>
          </svg>
        </motion.button>
      </div>
      <p className="term-orb-label">
        {remaining > 0 ? "Küreye dokun, bir terim çek" : "Kürede terim kalmadı"}
      </p>
    </div>
  );
}
