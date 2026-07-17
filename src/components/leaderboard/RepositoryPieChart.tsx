"use client";

import { useState } from "react";
import type { ChartActivityCategory } from "@/lib/leaderboard/chart-data";
import type { PieChartSegment } from "@/lib/leaderboard/chart-data";

const PIE_GAP_DEGREES = 2.5;
const PIE_CATEGORIES = new Set<ChartActivityCategory>(["prs", "reviews", "issues"]);

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

type RepositoryPieChartProps = {
  segments: PieChartSegment[];
  selectedId: ChartActivityCategory | null;
  onSelect: (id: ChartActivityCategory) => void;
};

export function RepositoryPieChart({
  segments,
  selectedId,
  onSelect,
}: RepositoryPieChartProps) {
  const [hoverId, setHoverId] = useState<ChartActivityCategory | null>(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const center = 90;
  const outerRadius = 74;
  const innerRadius = 50;
  const highlightedId =
    selectedId && PIE_CATEGORIES.has(selectedId) ? selectedId : hoverId;

  let cursor = 0;
  const slices = segments.map((segment, index) => {
    const sweep = (segment.value / total) * 360;
    const gap = segments.length > 1 ? PIE_GAP_DEGREES : 0;
    const startAngle = cursor + gap / 2;
    const endAngle = cursor + sweep - gap / 2;
    cursor += sweep;

    return {
      ...segment,
      path: describeDonutSlice(center, center, outerRadius, innerRadius, startAngle, endAngle),
      delay: `${0.14 + index * 0.08}s`,
    };
  });

  const clearHover = () => setHoverId(null);

  return (
    <section
      aria-label="Repository activity pie chart"
      className="chart-card graph-panel doc-card p-4 sm:p-5 md:p-6"
      onMouseLeave={clearHover}
    >
      <div className="chart-card-header">
        <h3 className="chart-card-title">Composition</h3>
        <p className="chart-card-subtitle">
          <span className="sm:hidden">Tap a slice to view activity</span>
          <span className="hidden sm:inline">Click a slice to view matching activity</span>
        </p>
      </div>

      {segments.length === 0 ? (
        <p className="chart-empty-state mt-6">No scored activity in this window yet.</p>
      ) : (
        <div
          className={`pie-chart-layout mt-6${highlightedId ? " pie-chart-layout-active" : ""}`}
        >
          <div className="pie-chart-visual">
            <svg
              viewBox="0 0 180 180"
              className="pie-chart-svg"
              role="img"
              aria-label={`Activity mix donut chart with ${total} total scored events`}
            >
              <defs>
                <linearGradient id="pie-gradient-prs" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#d4d4d4" />
                </linearGradient>
                <linearGradient id="pie-gradient-reviews" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4d4d4" />
                  <stop offset="100%" stopColor="#8a8a8a" />
                </linearGradient>
                <linearGradient id="pie-gradient-issues" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a3a3a3" />
                  <stop offset="100%" stopColor="#666666" />
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
                const isSelected = selectedId === slice.id;

                return (
                  <path
                    key={slice.id}
                    d={slice.path}
                    className={`pie-chart-slice pie-chart-slice-${slice.id}${isActive ? " pie-chart-slice-active" : ""}${isDimmed ? " pie-chart-slice-dimmed" : ""}${isSelected ? " pie-chart-slice-selected" : ""}`}
                    style={{ animationDelay: slice.delay }}
                    onMouseEnter={() => setHoverId(slice.id)}
                    onMouseLeave={clearHover}
                    onClick={() => onSelect(slice.id)}
                    onFocus={() => setHoverId(slice.id)}
                    onBlur={clearHover}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(slice.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`${slice.label}: ${slice.value}. Click to show list.`}
                  />
                );
              })}
            </svg>
            <div className="pie-chart-center" aria-hidden="true">
              <p className="pie-chart-total">{total}</p>
              <p className="pie-chart-total-label">Scored</p>
            </div>
          </div>

          <ul className="pie-chart-legend">
            {segments.map((segment, index) => {
              const isActive = highlightedId === segment.id;
              const isDimmed = highlightedId !== null && !isActive;
              const isSelected = selectedId === segment.id;

              return (
                <li key={segment.id}>
                  <button
                    type="button"
                    className={`pie-chart-legend-item anim-fade-in-up${isActive ? " pie-chart-legend-item-active" : ""}${isDimmed ? " pie-chart-legend-item-dimmed" : ""}${isSelected ? " pie-chart-legend-item-selected" : ""}`}
                    style={{ animationDelay: `${0.16 + index * 0.07}s` }}
                    onMouseEnter={() => setHoverId(segment.id)}
                    onFocus={() => setHoverId(segment.id)}
                    onBlur={clearHover}
                    onClick={() => onSelect(segment.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="pie-chart-legend-top">
                      <span
                        className={`pie-chart-legend-swatch pie-chart-legend-swatch-${segment.id}`}
                      />
                      <span className="pie-chart-legend-label">{segment.label}</span>
                      <span className="pie-chart-legend-value">{segment.value}</span>
                    </div>
                    <div className="pie-chart-legend-track" aria-hidden="true">
                      <div
                        className={`pie-chart-legend-bar pie-chart-legend-bar-${segment.id}`}
                        style={{
                          width: `${segment.percentage}%`,
                          animationDelay: `${0.2 + index * 0.07}s`,
                        }}
                      />
                    </div>
                    <p className="pie-chart-legend-meta">
                      {segment.percentage.toFixed(segment.percentage < 10 ? 1 : 0)}% of scored
                      activity
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
