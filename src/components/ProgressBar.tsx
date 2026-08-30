import { motion } from "framer-motion";

export default function ProgressBar({
  current,
  total,
  label = "Soru",
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress-wrap">
      <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="progress-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
        />
      </div>
      <span className="progress-label">
        {label} {current + 1} / {total}
      </span>
    </div>
  );
}
