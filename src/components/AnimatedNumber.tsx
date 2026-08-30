import { useEffect, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1100;
    const start = Date.now();

    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      setDisplay(Math.round(value * easeOutCubic(t)));
      if (t >= 1) clearInterval(id);
    }, 40);

    return () => clearInterval(id);
  }, [value]);

  return <span>{display}</span>;
}
