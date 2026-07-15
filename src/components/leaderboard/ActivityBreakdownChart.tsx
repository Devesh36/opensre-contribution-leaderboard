import {
  buildBreakdownChartItems,
  maxBreakdownValue,
  type BreakdownChartItem,
} from "@/lib/leaderboard/chart-data";

type ActivityBreakdownChartProps = {
  mergedPullRequests: number;
  substantiveReviews: number;
  linkedIssuesClosed: number;
  title?: string;
  subtitle?: string;
};

function BreakdownBar({
  item,
  maxValue,
  index,
}: {
  item: BreakdownChartItem;
  maxValue: number;
  index: number;
}) {
  const widthPercent = maxValue === 0 ? 0 : (item.value / maxValue) * 100;

  return (
    <div className="graph-row">
      <div className="graph-row-label">
        <span>{item.label}</span>
        <span className="graph-row-value">{item.value}</span>
      </div>
      <div className="graph-track" aria-hidden="true">
        <div
          className="graph-bar-horizontal"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: item.color,
            animationDelay: `${0.08 + index * 0.1}s`,
          }}
        />
      </div>
    </div>
  );
}

export function ActivityBreakdownChart({
  mergedPullRequests,
  substantiveReviews,
  linkedIssuesClosed,
  title = "Activity breakdown",
  subtitle = "How this contributor earned their score",
}: ActivityBreakdownChartProps) {
  const items = buildBreakdownChartItems({
    mergedPullRequests,
    substantiveReviews,
    linkedIssuesClosed,
  });
  const maxValue = maxBreakdownValue(items);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return null;
  }

  return (
    <section aria-label={title} className="graph-panel doc-card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="doc-section-title">{title}</h2>
          <p className="doc-meta mt-2">{subtitle}</p>
        </div>
        <p className="doc-meta shrink-0">{total} total</p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <BreakdownBar
            key={item.id}
            item={item}
            maxValue={maxValue}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
