"use client";

import { useEffect, useState } from "react";

type AnimatedStatProps = {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

export function AnimatedStat({
  value,
  suffix = "",
  durationMs = 650,
  className = "",
}: AnimatedStatProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 4;
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, value]);

  return (
    <span className={`benchmark-animated-stat tabular-nums ${className}`}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
