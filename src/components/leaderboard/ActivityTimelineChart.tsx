import {
  buildDailyActivityBuckets,
  maxDailyActivity,
  type DailyActivityBucket,
} from "@/lib/leaderboard/chart-data";
import type { CSSProperties } from "react";
import type { ContributionWindow } from "@/lib/leaderboard/types";

type ActivityTimelineChartProps = {
  window: ContributionWindow;
  mergedPullRequests: Array<{ mergedAt: string }>;
  reviews: Array<{ submittedAt: string }>;
  title?: string;
  subtitle?: string;
};

function TimelineBar({
  bucket,
  maxCount,
  index,
}: {
  bucket: DailyActivityBucket;
  maxCount: number;
  index: number;
}) {
  const heightPercent = maxCount === 0 ? 0 : (bucket.count / maxCount) * 100;
  const prHeight =
    bucket.count === 0 ? 0 : (bucket.prs / bucket.count) * heightPercent;
  const reviewHeight = heightPercent - prHeight;

  return (
    <div className="graph-timeline-column">
      <div className="graph-timeline-value">{bucket.count > 0 ? bucket.count : ""}</div>
      <div className="graph-timeline-track" aria-hidden="true">
        <div
          className="graph-bar-stack graph-bar-stack-reviews"
          style={{
            height: `${reviewHeight}%`,
            animationDelay: `${0.12 + index * 0.04}s`,
          }}
        />
        <div
          className="graph-bar-stack graph-bar-stack-prs"
          style={{
            height: `${prHeight}%`,
            animationDelay: `${0.16 + index * 0.04}s`,
          }}
        />
      </div>
      <div className="graph-timeline-label">{bucket.label}</div>
    </div>
  );
}

export function ActivityTimelineChart({
  window,
  mergedPullRequests,
  reviews,
  title = "Activity timeline",
  subtitle = "Daily contributions across the selected window",
}: ActivityTimelineChartProps) {
  const buckets = buildDailyActivityBuckets({
    window,
    mergedPullRequests,
    reviews,
  });
  const maxCount = maxDailyActivity(buckets);
  const hasActivity = buckets.some((bucket) => bucket.count > 0);

  if (!hasActivity) {
    return null;
  }

  return (
    <section aria-label={title} className="graph-panel doc-card p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="doc-section-title">{title}</h2>
          <p className="doc-meta mt-2">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="graph-legend-item">
            <span className="graph-legend-swatch graph-legend-swatch-prs" />
            Merged PRs
          </span>
          <span className="graph-legend-item">
            <span className="graph-legend-swatch graph-legend-swatch-reviews" />
            Reviews
          </span>
        </div>
      </div>

      <div className="graph-timeline-scroll mt-4 sm:mt-6">
        {window.days > 7 ? (
          <p className="scroll-hint doc-meta mb-3 lg:hidden">Swipe to see all days →</p>
        ) : null}
        <div
          className="graph-timeline-grid graph-timeline-grid-responsive"
          style={
            { "--timeline-columns": buckets.length } as CSSProperties
          }
        >
          {buckets.map((bucket, index) => (
            <TimelineBar
              key={bucket.date}
              bucket={bucket}
              maxCount={maxCount}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
