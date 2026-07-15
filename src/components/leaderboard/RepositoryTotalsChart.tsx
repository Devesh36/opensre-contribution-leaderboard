import type { RepositoryTotals } from "@/lib/leaderboard/types";

type RepositoryTotalsChartProps = {
  totals: RepositoryTotals;
};

export function RepositoryTotalsChart({ totals }: RepositoryTotalsChartProps) {
  const items = [
    {
      id: "contributors",
      label: "Contributors",
      value: totals.activeContributors,
      color: "#ffffff",
    },
    {
      id: "prs",
      label: "Merged PRs",
      value: totals.mergedPullRequests,
      color: "#e5e5e5",
    },
    {
      id: "reviews",
      label: "Reviews",
      value: totals.substantiveReviews,
      color: "#d4d4d4",
    },
    {
      id: "issues",
      label: "Linked issues",
      value: totals.linkedIssuesClosed,
      color: "#a3a3a3",
    },
  ];

  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <section
      aria-label="Repository activity chart"
      className="graph-panel doc-card anim-fade-in-up anim-stagger-5 p-5"
    >
      <p className="doc-kicker">Activity graph</p>
      <h2 className="doc-section-title mt-2">Repository pulse</h2>
      <p className="doc-meta mt-2">
        Relative volume across the current time window.
      </p>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;

          return (
            <div key={item.id} className="graph-row">
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
                    animationDelay: `${0.1 + index * 0.08}s`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
