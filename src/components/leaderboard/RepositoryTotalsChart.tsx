import {
  buildRepositoryBarChartItems,
} from "@/lib/leaderboard/chart-data";
import type {
  ContributorRecord,
  RepositoryActivityDetail,
  RepositoryTotals,
} from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import { RepositoryChartsPanel } from "./RepositoryChartsPanel";

type RepositoryTotalsChartProps = {
  totals: RepositoryTotals;
  activityDetail?: RepositoryActivityDetail;
  contributors: ContributorRecord[];
  repository: string;
  windowPreset: WindowPresetId;
};

export function RepositoryTotalsChart({
  totals,
  activityDetail,
  contributors,
  repository,
  windowPreset,
}: RepositoryTotalsChartProps) {
  const barItems = buildRepositoryBarChartItems(totals);
  const hasActivity = barItems.some((item) => item.value > 0);

  if (!hasActivity) {
    return (
      <section
        aria-label="Repository activity charts"
        className="repository-charts-shell graph-panel doc-card anim-fade-in-up anim-stagger-5 p-4 sm:p-5 md:p-6"
      >
        <div className="chart-card-header">
          <p className="doc-kicker">Repository pulse</p>
          <h2 className="doc-section-title mt-2">Activity overview</h2>
          <p className="doc-meta mt-2">Relative volume across the current time window.</p>
        </div>
        <p className="chart-empty-state mt-6">No repository activity in this window yet.</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Repository activity charts"
      className="repository-charts-shell anim-fade-in-up anim-stagger-5"
    >
      <div className="repository-charts-intro">
        <p className="doc-kicker">Repository pulse</p>
        <h2 className="doc-section-title mt-2">Activity overview</h2>
        <p className="doc-meta mt-2">
          Click a bar or slice to explore activity in this window.
        </p>
      </div>

      <RepositoryChartsPanel
        totals={totals}
        activityDetail={activityDetail}
        contributors={contributors}
        repository={repository}
        windowPreset={windowPreset}
      />
    </section>
  );
}
