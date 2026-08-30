import { useState, type CSSProperties } from "react";

const sparkleGlyphs = ["✦", "✧", "★", "●"];

interface Piece {
  id: number;
  angle: number;
  distance: number;
  delay: number;
  duration: number;
  size: number;
  glyph: string;
}

// A small, localized celebration burst — sparkles radiating out from the
// center of whatever it's placed inside. Meant for "correct answer" moments
// across modes, lighter-weight than the full-screen ConfettiBurst.
export default function SparkleBurst({ count = 12, color = "#f59e0b" }: { count?: number; color?: string }) {
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + (Math.random() * 20 - 10),
      distance: 40 + Math.random() * 36,
      delay: Math.random() * 0.08,
      duration: 0.55 + Math.random() * 0.35,
      size: 10 + Math.random() * 8,
      glyph: sparkleGlyphs[i % sparkleGlyphs.length],
    }))
  );

  return (
    <div className="sparkle-burst" aria-hidden="true">
      <span className="sparkle-ring" style={{ borderColor: color }} />
      {pieces.map((p) => (
        <span
          key={p.id}
          className="sparkle-piece"
          style={
            {
              "--sparkle-angle": `${p.angle}deg`,
              "--sparkle-distance": `${p.distance}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              fontSize: p.size,
              color,
            } as CSSProperties
          }
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
