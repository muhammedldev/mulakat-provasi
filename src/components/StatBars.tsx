import { motion } from "framer-motion";
import type { Stats } from "../types";
import { statLabels } from "../data/profiles";

const statOrder: (keyof Stats)[] = ["hazirlik", "iletisim", "ozguven"];
const statShortLabel: Record<keyof Stats, string> = { hazirlik: "Hzr", iletisim: "İlt", ozguven: "Özg" };

// Compact variant: a single slim row (icon-free mini bars) so the stats
// don't compete with the question for vertical space on small screens.
export default function StatBars({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  if (compact) {
    return (
      <div className="stat-bars stat-bars--compact" role="group" aria-label="Mülakat istatistiklerin">
        {statOrder.map((key) => (
          <div className="stat-mini" key={key} title={`${statLabels[key]}: ${stats[key]}`}>
            <span className="stat-mini-label">{statShortLabel[key]}</span>
            <div className="stat-track stat-track--mini">
              <motion.div
                className={`stat-fill stat-fill--${key}`}
                initial={false}
                animate={{ width: `${stats[key]}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <span className="stat-mini-value">{stats[key]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stat-bars" role="group" aria-label="Mülakat istatistiklerin">
      {statOrder.map((key) => (
        <div className="stat-row" key={key}>
          <div className="stat-row-label">
            <span>{statLabels[key]}</span>
            <span className="stat-value">{stats[key]}</span>
          </div>
          <div className="stat-track">
            <motion.div
              className={`stat-fill stat-fill--${key}`}
              initial={false}
              animate={{ width: `${stats[key]}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
