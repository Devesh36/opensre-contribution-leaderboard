"use client";

import { useState } from "react";
import { BENCHMARK_METRIC_WEIGHTS } from "@/lib/benchmarks/content";

const PIE_GAP_DEGREES = 2.5;

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export function BenchmarkMetricDonut() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const total = BENCHMARK_METRIC_WEIGHTS.reduce((sum, segment) => sum + segment.value, 0);
  const center = 90;
  const outerRadius = 74;
  const innerRadius = 50;

  let cursor = 0;
  const slices = BENCHMARK_METRIC_WEIGHTS.map((segment, index) => {
    const sweep = (segment.value / total) * 360;
    const gap = BENCHMARK_METRIC_WEIGHTS.length > 1 ? PIE_GAP_DEGREES : 0;
    const startAngle = cursor + gap / 2;
    const endAngle = cursor + sweep - gap / 2;
    cursor += sweep;

    return {
      ...segment,
      percentage: (segment.value / total) * 100,
      path: describeDonutSlice(center, center, outerRadius, innerRadius, startAngle, endAngle),
      delay: `${0.05 + index * 0.04}s`,
    };
  });

  const highlightedId = activeId;

  return (
    <section
      aria-label="Benchmark metric family composition chart"
      className="benchmark-metric-donut chart-card graph-panel doc-card p-3 sm:p-5 md:p-6"
      onMouseLeave={() => setActiveId(null)}
    >
      <div className="chart-card-header">
        <h3 className="chart-card-title">Metric mix</h3>
        <p className="chart-card-subtitle">Relative weight across scoring families</p>
      </div>

      <div
        className={`pie-chart-layout mt-6${highlightedId ? " pie-chart-layout-active" : ""}`}
      >
        <div className="pie-chart-visual">
            <svg
              viewBox="0 0 180 180"
              className="pie-chart-svg"
              role="img"
              aria-label="Donut chart of benchmark metric families"
            >
              <defs>
                <linearGradient id="benchmark-gradient-outcome" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#d4d4d4" />
                </linearGradient>
                <linearGradient id="benchmark-gradient-process" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4d4d4" />
                  <stop offset="100%" stopColor="#a3a3a3" />
                </linearGradient>
              </defs>
              <circle
              cx={center}
              cy={center}
              r={outerRadius}
              className="pie-chart-halo"
              aria-hidden="true"
            />
            {slices.map((slice) => {
              const isActive = highlightedId === slice.id;
              const isDimmed = highlightedId !== null && !isActive;

              return (
                <path
                  key={slice.id}
                  d={slice.path}
                  className={`pie-chart-slice benchmark-pie-slice benchmark-pie-slice-${slice.id}${isActive ? " pie-chart-slice-active" : ""}${isDimmed ? " pie-chart-slice-dimmed" : ""}`}
                  style={{ animationDelay: slice.delay }}
                  onMouseEnter={() => setActiveId(slice.id)}
                  onFocus={() => setActiveId(slice.id)}
                  onBlur={() => setActiveId(null)}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${slice.label}: ${slice.value}% weight`}
                />
              );
            })}
          </svg>
          <div className="pie-chart-center" aria-hidden="true">
            <p className="pie-chart-total">18</p>
            <p className="pie-chart-total-label">Metrics</p>
          </div>
        </div>

        <ul className="pie-chart-legend">
          {slices.map((slice, index) => {
            const isActive = highlightedId === slice.id;
            const isDimmed = highlightedId !== null && !isActive;

            return (
              <li key={slice.id}>
                <button
                  type="button"
                  className={`pie-chart-legend-item anim-fade-in-up${isActive ? " pie-chart-legend-item-active" : ""}${isDimmed ? " pie-chart-legend-item-dimmed" : ""}`}
                  style={{ animationDelay: `${0.08 + index * 0.04}s` }}
                  onMouseEnter={() => setActiveId(slice.id)}
                  onFocus={() => setActiveId(slice.id)}
                  onBlur={() => setActiveId(null)}
                >
                  <div className="pie-chart-legend-top">
                    <span
                      className={`pie-chart-legend-swatch benchmark-legend-swatch-${slice.id}`}
                      style={{ background: slice.color }}
                    />
                    <span className="pie-chart-legend-label">{slice.label}</span>
                    <span className="pie-chart-legend-value">{slice.value}%</span>
                  </div>
                  <div className="pie-chart-legend-track" aria-hidden="true">
                    <div
                      className={`pie-chart-legend-bar benchmark-legend-bar-${slice.id}`}
                      style={{
                        width: `${slice.percentage}%`,
                        animationDelay: `${0.1 + index * 0.04}s`,
                      }}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
