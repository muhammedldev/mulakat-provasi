import { useEffect, useRef, useState } from "react";

export default function TimerBar({
  questionId,
  seconds,
  onExpire,
  paused = false,
}: {
  questionId: string;
  seconds: number;
  onExpire: () => void;
  paused?: boolean;
}) {
  const [remainingPct, setRemainingPct] = useState(100);
  const startRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const accumulatedPauseRef = useRef(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    startRef.current = Date.now();
    accumulatedPauseRef.current = 0;
    pausedAtRef.current = paused ? Date.now() : null;
    expiredRef.current = false;
    setRemainingPct(100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  useEffect(() => {
    if (paused) {
      pausedAtRef.current = Date.now();
    } else if (pausedAtRef.current !== null) {
      accumulatedPauseRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [paused]);

  useEffect(() => {
    const id = setInterval(() => {
      if (paused || expiredRef.current) return;
      const elapsedMs = Date.now() - startRef.current - accumulatedPauseRef.current;
      const pct = Math.max(0, 100 - (elapsedMs / (seconds * 1000)) * 100);
      setRemainingPct(pct);
      if (pct <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [questionId, seconds, paused]);

  return (
    <div className="timer-track" aria-hidden="true">
      <div className="timer-fill" style={{ width: `${remainingPct}%` }} />
    </div>
  );
}
