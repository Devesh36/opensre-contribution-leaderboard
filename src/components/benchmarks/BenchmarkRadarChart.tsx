"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  BENCHMARK_RADAR_AXES,
  BENCHMARK_RADAR_CAPTION,
  BENCHMARK_RADAR_SERIES,
  OPENSRE_BRAND_COLOR,
} from "@/lib/benchmarks/content";

const CENTER = 250;
const MAX_RADIUS = 148;
const MAX_RADIUS_COMPACT = 112;
const LABEL_OFFSET = 34;
const LABEL_OFFSET_COMPACT = 18;
const LEVELS = 5;
const START_ANGLE = -Math.PI / 2;

function useCompactRadar() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function pointAt(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function axisAngle(index: number, count: number) {
  return START_ANGLE + (index * 2 * Math.PI) / count;
}

function seriesPath(values: number[], count: number, maxRadius: number): string {
  return values
    .map((value, index) => {
      const radius = (Math.max(0, Math.min(value, 100)) / 100) * maxRadius;
      const { x, y } = pointAt(axisAngle(index, count), radius);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ")
    .concat(" Z");
}

function labelAnchor(angle: number): "start" | "middle" | "end" {
  const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (normalized > Math.PI * 0.3 && normalized < Math.PI * 0.7) {
    return "start";
  }
  if (normalized > Math.PI * 1.3 && normalized < Math.PI * 1.7) {
    return "end";
  }
  return "middle";
}

function labelOffset(angle: number, maxRadius: number, labelGap: number) {
  const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const labelRadius = maxRadius + labelGap;

  let extraX = 0;
  let extraY = 0;

  if (normalized > Math.PI * 1.65 || normalized < Math.PI * 0.35) {
    extraY = -6;
  } else if (normalized > Math.PI * 0.35 && normalized < Math.PI * 0.65) {
    extraX = 10;
  } else if (normalized > Math.PI * 0.65 && normalized < Math.PI * 1.35) {
    extraY = 10;
  } else {
    extraX = -10;
  }

  const { x, y } = pointAt(angle, labelRadius);
  return { x: x + extraX, y: y + extraY };
}

export function BenchmarkRadarChart() {
  const [activeId, setActiveId] = useState<string>("opensre");
  const [drawn, setDrawn] = useState(false);
  const compact = useCompactRadar();
  const fillId = useId().replace(/:/g, "");
  const axisCount = BENCHMARK_RADAR_AXES.length;
  const maxRadius = compact ? MAX_RADIUS_COMPACT : MAX_RADIUS;
  const labelGap = compact ? LABEL_OFFSET_COMPACT : LABEL_OFFSET;

  const seriesPaths = useMemo(
    () =>
      BENCHMARK_RADAR_SERIES.map((series) => ({
        ...series,
        path: seriesPath(series.values, axisCount, maxRadius),
      })),
    [axisCount, maxRadius],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDrawn(true), 24);
    return () => window.clearTimeout(timer);
  }, []);

  const highlightedId = activeId;
  const primaryColor =
    seriesPaths.find((series) => series.primary)?.color ?? OPENSRE_BRAND_COLOR;

  return (
    <section
      aria-label="Benchmark capability radar chart"
      className="benchmark-radar chart-card graph-panel doc-card overflow-visible p-3 sm:p-5 md:p-6"
    >
      <div className="benchmark-radar-header text-center">
        <p className="doc-kicker">Capability profile</p>
        <h3 className="benchmark-radar-title mt-2">
          A well-rounded SRE evaluation profile
        </h3>
        <p className="chart-card-subtitle mx-auto mt-3 max-w-2xl">
          Preview scores across CloudOpsBench metric families
        </p>
      </div>

      <div
        className={`benchmark-radar-stage${compact ? " benchmark-radar-stage-compact" : ""} mt-4 sm:mt-6${drawn ? " benchmark-radar-stage-drawn" : ""}${highlightedId ? " benchmark-radar-stage-active" : ""}`}
        onMouseLeave={() => setActiveId("opensre")}
      >
        <svg
          viewBox="0 0 500 500"
          className="benchmark-radar-svg"
          role="img"
          aria-label="Radar chart comparing benchmark arms across ten metrics"
        >
          <defs>
            <radialGradient id={`${fillId}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.16" />
              <stop offset="55%" stopColor={primaryColor} stopOpacity="0.06" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.01" />
            </radialGradient>
            <filter id={`${fillId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="10"
                floodColor={primaryColor}
                floodOpacity="0.32"
              />
            </filter>
          </defs>

          {Array.from({ length: LEVELS }).map((_, levelIndex) => {
            const levelRadius = ((levelIndex + 1) / LEVELS) * maxRadius;
            const ringPoints = Array.from({ length: axisCount })
              .map((__, axisIndex) => {
                const { x, y } = pointAt(axisAngle(axisIndex, axisCount), levelRadius);
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <polygon
                key={levelRadius}
                points={ringPoints}
                className="benchmark-radar-grid-ring"
                style={{ animationDelay: `${levelIndex * 0.025}s` }}
              />
            );
          })}

          {BENCHMARK_RADAR_AXES.map((axis, index) => {
            const angle = axisAngle(index, axisCount);
            const outer = pointAt(angle, maxRadius);

            return (
              <line
                key={axis.id}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                className="benchmark-radar-grid-spoke"
                style={{ animationDelay: `${0.03 + index * 0.015}s` }}
              />
            );
          })}

          {seriesPaths
            .filter((series) => !series.primary)
            .map((series, index) => {
              const isActive = highlightedId === series.id;
              const isDimmed = highlightedId !== null && !isActive;

              return (
                <g key={series.id}>
                  <path
                    d={series.path}
                    className={`benchmark-radar-series benchmark-radar-series-secondary${isActive ? " benchmark-radar-series-active" : ""}${isDimmed ? " benchmark-radar-series-dimmed" : ""}`}
                    style={{
                      stroke: series.color,
                      animationDelay: `${0.14 + index * 0.05}s`,
                    }}
                    onMouseEnter={() => setActiveId(series.id)}
                  />
                  {series.values.map((value, pointIndex) => {
                    const radius = (value / 100) * maxRadius;
                    const { x, y } = pointAt(axisAngle(pointIndex, axisCount), radius);

                    return (
                      <circle
                        key={`${series.id}-${pointIndex}`}
                        cx={x}
                        cy={y}
                        r={compact ? 2.5 : 3}
                        className={`benchmark-radar-point benchmark-radar-point-secondary${isActive ? " benchmark-radar-point-active" : ""}${isDimmed ? " benchmark-radar-point-dimmed" : ""}`}
                        style={{
                          stroke: series.color,
                          animationDelay: `${0.2 + index * 0.05 + pointIndex * 0.01}s`,
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}

          {seriesPaths
            .filter((series) => series.primary)
            .map((series) => {
              const isActive = highlightedId === series.id;
              const isDimmed = highlightedId !== null && !isActive;

              return (
                <g key={series.id}>
                  <path
                    d={series.path}
                    className={`benchmark-radar-series-fill${isActive ? " benchmark-radar-series-fill-active" : ""}${isDimmed ? " benchmark-radar-series-dimmed" : ""}`}
                    fill={`url(#${fillId}-glow)`}
                    style={{ animationDelay: "0.22s" }}
                  />
                  <path
                    d={series.path}
                    className={`benchmark-radar-series benchmark-radar-series-primary${isActive ? " benchmark-radar-series-active" : ""}${isDimmed ? " benchmark-radar-series-dimmed" : ""}`}
                    style={{
                      stroke: series.color,
                      animationDelay: "0.2s",
                      filter: isActive ? `url(#${fillId}-shadow)` : undefined,
                    }}
                    onMouseEnter={() => setActiveId(series.id)}
                  />
                  {series.values.map((value, pointIndex) => {
                    const radius = (value / 100) * maxRadius;
                    const { x, y } = pointAt(axisAngle(pointIndex, axisCount), radius);

                    return (
                      <circle
                        key={`${series.id}-${pointIndex}`}
                        cx={x}
                        cy={y}
                        r={compact ? 3.5 : 4.5}
                        className={`benchmark-radar-point benchmark-radar-point-primary${isActive ? " benchmark-radar-point-active" : ""}${isDimmed ? " benchmark-radar-point-dimmed" : ""}`}
                        style={{
                          fill: series.color,
                          stroke: series.color,
                          animationDelay: `${0.26 + pointIndex * 0.015}s`,
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}

          {BENCHMARK_RADAR_AXES.map((axis, index) => {
            const angle = axisAngle(index, axisCount);
            const { x, y } = labelOffset(angle, maxRadius, labelGap);
            const anchor = labelAnchor(angle);

            return (
              <g
                key={axis.id}
                className="benchmark-radar-label"
                style={{ animationDelay: `${0.08 + index * 0.02}s` }}
              >
                <text
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  className="benchmark-radar-label-title benchmark-radar-label-title-short"
                >
                  {axis.shortLabel}
                </text>
                <text
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  className="benchmark-radar-label-title benchmark-radar-label-title-full"
                >
                  {axis.label}
                </text>
                {!compact ? (
                  <text
                    x={x}
                    y={y + 14}
                    textAnchor={anchor}
                    className="benchmark-radar-label-category"
                  >
                    {axis.category}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="benchmark-radar-legend mt-5" role="list">
        {BENCHMARK_RADAR_SERIES.map((series) => {
          const isActive = highlightedId === series.id;

          return (
            <button
              key={series.id}
              type="button"
              role="listitem"
              className={`benchmark-radar-legend-item${isActive ? " benchmark-radar-legend-item-active" : ""}${highlightedId !== null && !isActive ? " benchmark-radar-legend-item-dimmed" : ""}`}
              onMouseEnter={() => setActiveId(series.id)}
              onFocus={() => setActiveId(series.id)}
              onClick={() => setActiveId(series.id)}
              aria-pressed={isActive}
            >
              <span
                className={`benchmark-radar-legend-line${series.primary ? " benchmark-radar-legend-line-primary" : ""}`}
                style={{ borderColor: series.color, backgroundColor: series.primary ? series.color : "transparent" }}
                aria-hidden="true"
              />
              <span className="benchmark-radar-legend-copy">
                <span className="hidden sm:inline">{series.label}</span>
                <span className="sm:hidden">{series.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="doc-meta mt-4 text-center text-xs sm:text-sm">{BENCHMARK_RADAR_CAPTION}</p>
    </section>
  );
}
