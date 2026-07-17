"use client";

import { useState } from "react";
import {
  buildRepositoryBarChartItems,
  buildRepositoryPieChartSegments,
  isChartActivityCategory,
  maxBreakdownValue,
  type BreakdownChartItem,
  type ChartActivityCategory,
} from "@/lib/leaderboard/chart-data";
import type {
  ContributorRecord,
  RepositoryActivityDetail,
  RepositoryTotals,
} from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import { ChartActivityDetailList } from "./ChartActivityDetailList";
import { RepositoryPieChart } from "./RepositoryPieChart";

type RepositoryChartsPanelProps = {
  totals: RepositoryTotals;
  activityDetail?: RepositoryActivityDetail;
  contributors: ContributorRecord[];
  repository: string;
  windowPreset: WindowPresetId;
};

function RepositoryBarChart({
  items,
  maxValue,
  selectedId,
  onSelect,
}: {
  items: BreakdownChartItem[];
  maxValue: number;
  selectedId: ChartActivityCategory | null;
  onSelect: (id: ChartActivityCategory) => void;
}) {
  return (
    <section
      aria-label="Repository activity bar chart"
      className="chart-card graph-panel doc-card p-4 sm:p-5 md:p-6"
    >
      <div className="chart-card-header">
        <h3 className="chart-card-title">Volume</h3>
        <p className="chart-card-subtitle">
          <span className="sm:hidden">Tap a bar to view activity</span>
          <span className="hidden sm:inline">Click a bar to view matching activity</span>
        </p>
      </div>

      <div className="bar-chart-scroll mt-6">
        <div
          className={`bar-chart${selectedId ? " bar-chart-has-selection" : ""}`}
          role="group"
          aria-label="Vertical bar chart of repository activity"
        >
          {items.map((item, index) => {
            const heightPercent = Math.max(
              (item.value / maxValue) * 100,
              item.value > 0 ? 8 : 0,
            );
            const isSelected = selectedId === item.id;
            const isDimmed = selectedId !== null && !isSelected;

            return (
              <button
                key={item.id}
                type="button"
                className={`bar-chart-column bar-chart-column-interactive${isSelected ? " bar-chart-column-selected" : ""}${isDimmed ? " bar-chart-column-dimmed" : ""}`}
                onClick={() => onSelect(item.id)}
                aria-pressed={isSelected}
                aria-label={`${item.label}: ${item.value}. Tap to show list.`}
              >
                <span className={`bar-chart-value bar-chart-value-${item.id}`}>
                  {item.value}
                </span>
                <div className="bar-chart-track" aria-hidden="true">
                  <div
                    className={`bar-chart-bar bar-chart-bar-${item.id}`}
                    style={{
                      height: `${heightPercent}%`,
                      animationDelay: `${0.12 + index * 0.08}s`,
                    }}
                  />
                </div>
                <p className="bar-chart-label">
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function RepositoryChartsPanel({
  totals,
  activityDetail,
  contributors,
  repository,
  windowPreset,
}: RepositoryChartsPanelProps) {
  const [selectedId, setSelectedId] = useState<ChartActivityCategory | null>(null);
  const barItems = buildRepositoryBarChartItems(totals);
  const pieSegments = buildRepositoryPieChartSegments(totals);
  const maxValue = maxBreakdownValue(barItems);

  const handleSelect = (id: string) => {
    if (!isChartActivityCategory(id)) {
      return;
    }

    setSelectedId((current) => (current === id ? null : id));
  };

  return (
    <div className="repository-charts-panel space-y-4">
      <div className="interaction-group repository-charts">
        <RepositoryBarChart
          items={barItems}
          maxValue={maxValue}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <RepositoryPieChart
          segments={pieSegments}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {selectedId ? (
        <ChartActivityDetailList
          category={selectedId}
          repository={repository}
          contributors={contributors}
          activityDetail={activityDetail}
          windowPreset={windowPreset}
        />
      ) : null}
    </div>
  );
}
