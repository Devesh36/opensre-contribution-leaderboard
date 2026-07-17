"use client";

import { useState } from "react";
import { BENCHMARK_PREVIEW_COMPARISON } from "@/lib/benchmarks/content";

export function BenchmarkCompareChart() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const maxValue = Math.max(...BENCHMARK_PREVIEW_COMPARISON.arms.map((arm) => arm.value));

  return (
    <section
      aria-label="Benchmark comparison preview chart"
      className="benchmark-compare chart-card graph-panel doc-card p-3 sm:p-5 md:p-6"
    >
      <div className="chart-card-header">
        <h3 className="chart-card-title">Arm comparison</h3>
        <p className="chart-card-subtitle">
          {BENCHMARK_PREVIEW_COMPARISON.metric} preview — illustrative only
        </p>
      </div>

      <div
        className={`benchmark-compare-chart mt-6${activeId ? " benchmark-compare-chart-active" : ""}`}
        role="img"
        aria-label="Preview bar chart comparing OpenSRE plus LLM against LLM alone"
      >
        {BENCHMARK_PREVIEW_COMPARISON.arms.map((arm, index) => {
          const heightPercent = (arm.value / maxValue) * 100;
          const isActive = activeId === arm.id;
          const isDimmed = activeId !== null && !isActive;

          return (
            <button
              key={arm.id}
              type="button"
              className={`benchmark-compare-column${isActive ? " benchmark-compare-column-active" : ""}${isDimmed ? " benchmark-compare-column-dimmed" : ""}`}
              onMouseEnter={() => setActiveId(arm.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(arm.id)}
              onBlur={() => setActiveId(null)}
              onClick={() => setActiveId((current) => (current === arm.id ? null : arm.id))}
              aria-label={`${arm.label}: ${arm.value}% preview`}
            >
              <span className="benchmark-compare-value">{arm.value}%</span>
              <div className="benchmark-compare-track" aria-hidden="true">
                <div
                  className={`benchmark-compare-bar benchmark-compare-bar-${arm.id}`}
                  style={{
                    height: `${heightPercent}%`,
                    animationDelay: `${0.06 + index * 0.05}s`,
                    ...(arm.color
                      ? {
                          background: `linear-gradient(180deg, ${arm.color} 0%, #d4d4d4 100%)`,
                        }
                      : {}),
                  }}
                />
              </div>
              <p className="benchmark-compare-label">
                <span className="sm:hidden">{arm.shortLabel}</span>
                <span className="hidden sm:inline">{arm.label}</span>
              </p>
            </button>
          );
        })}
      </div>

      <p className="doc-meta mt-4 text-center text-xs sm:text-sm">
        {BENCHMARK_PREVIEW_COMPARISON.caption}
      </p>
    </section>
  );
}
