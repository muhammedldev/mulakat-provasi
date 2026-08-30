import type { ScoreHistoryEntry } from "../utils/insights";

const WIDTH = 520;
const HEIGHT = 160;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}.${month}`;
}

// Bağımlılıksız, saf SVG bir çizgi grafik — Klasik Mülakat skorlarının zaman
// içindeki gidişatını gösterir. Harici bir chart kütüphanesi eklemeye gerek
// yok, veri seti küçük (en fazla ~30 nokta) ve tek bir seri.
export default function ProgressChart({ data }: { data: ScoreHistoryEntry[] }) {
  if (data.length < 2) {
    return (
      <p className="progress-chart-empty">
        En az 2 Klasik Mülakat oyunu tamamlayınca burada zaman içindeki ilerlemeni gösteren bir
        grafik göreceksin.
      </p>
    );
  }

  const scores = data.map((d) => d.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;

  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = PAD_TOP + innerH - ((d.score - min) / range) * innerH;
    return { x, y, entry: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} Z`;

  const first = data[0];
  const last = data[data.length - 1];
  const trend = last.score - first.score;

  return (
    <div className="progress-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Klasik Mülakat skorlarının zaman içindeki grafiği">
        <defs>
          <linearGradient id="progress-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#progress-chart-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="var(--accent)" />
        ))}
      </svg>
      <div className="progress-chart-labels">
        <span>{formatShortDate(first.date)} · {first.score}/100</span>
        <span className={`progress-chart-trend${trend >= 0 ? " progress-chart-trend--up" : " progress-chart-trend--down"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} puan
        </span>
        <span>{formatShortDate(last.date)} · {last.score}/100</span>
      </div>
    </div>
  );
}
