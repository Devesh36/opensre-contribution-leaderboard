"use client";

import { useState } from "react";
import type { BenchmarkMetricFamily } from "@/lib/benchmarks/content";

const STAGGER_CLASSES = [
  "anim-stagger-1",
  "anim-stagger-2",
  "anim-stagger-3",
  "anim-stagger-4",
  "anim-stagger-5",
] as const;

const FAMILY_BARS: Record<string, number> = {
  outcome: 92,
  process: 78,
  efficiency: 64,
  robustness: 71,
  validity: 85,
};

type BenchmarkMetricCardsProps = {
  families: BenchmarkMetricFamily[];
};

export function BenchmarkMetricCards({ families }: BenchmarkMetricCardsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div
      className={`interaction-group benchmark-metric-cards grid gap-3 sm:grid-cols-2 xl:grid-cols-3${activeId ? " benchmark-metric-cards-active" : ""}`}
    >
      {families.map((family, index) => {
        const fill = FAMILY_BARS[family.id] ?? 60;
        const isActive = activeId === family.id;
        const isDimmed = activeId !== null && !isActive;

        return (
          <article
            key={family.id}
            className={`benchmark-metric-card doc-note-card rounded-sm border border-[#262626] bg-[#0a0a0a] p-3 sm:p-4 anim-fade-in-up ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}${isActive ? " benchmark-metric-card-active" : ""}${isDimmed ? " benchmark-metric-card-dimmed" : ""}`}
            onMouseEnter={() => setActiveId(family.id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(family.id)}
            onBlur={() => setActiveId(null)}
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-white">{family.name}</h3>
              <span className="benchmark-metric-card-score">{fill}%</span>
            </div>
            <p className="doc-meta mt-2 text-xs leading-relaxed sm:text-sm">
              {family.description}
            </p>

            <div className="benchmark-metric-card-track mt-4" aria-hidden="true">
              <div
                className={`benchmark-metric-card-bar benchmark-metric-card-bar-${family.id}`}
                style={{
                  width: `${fill}%`,
                  animationDelay: `${0.1 + index * 0.04}s`,
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {family.metrics.map((metric) => (
                <span key={metric} className="contributor-badge">
                  {metric}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
