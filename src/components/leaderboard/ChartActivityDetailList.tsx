import Image from "next/image";
import Link from "next/link";
import { buildContributorHref } from "@/components/leaderboard/nav";
import type { ChartActivityCategory } from "@/lib/leaderboard/chart-data";
import { getChartCategoryLabel } from "@/lib/leaderboard/chart-data";
import type {
  ContributorRecord,
  RepositoryActivityDetail,
} from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";

type ChartActivityDetailListProps = {
  category: ChartActivityCategory;
  repository: string;
  contributors: ContributorRecord[];
  activityDetail?: RepositoryActivityDetail;
  windowPreset: WindowPresetId;
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function reviewStateLabel(state: string): string {
  switch (state) {
    case "APPROVED":
      return "Approved";
    case "CHANGES_REQUESTED":
      return "Changes requested";
    case "COMMENTED":
      return "Review comment";
    default:
      return state;
  }
}

export function ChartActivityDetailList({
  category,
  repository,
  contributors,
  activityDetail,
  windowPreset,
}: ChartActivityDetailListProps) {
  const label = getChartCategoryLabel(category);

  if (!activityDetail && category !== "contributors") {
    return (
      <section
        aria-label={`${label} details`}
        className="chart-activity-detail-panel doc-card p-4 sm:p-5"
      >
        <p className="chart-empty-state">
          Detailed activity lists are unavailable for this cached snapshot. Refresh
          the leaderboard to load item-level data.
        </p>
      </section>
    );
  }

  if (category === "contributors") {
    if (contributors.length === 0) {
      return (
        <section
          aria-label={`${label} details`}
          className="chart-activity-detail-panel doc-card p-4 sm:p-5"
        >
          <p className="chart-empty-state">No active contributors in this window.</p>
        </section>
      );
    }

    return (
      <section
        aria-label={`${label} details`}
        className="chart-activity-detail-panel doc-card p-4 sm:p-5"
      >
        <div className="chart-activity-detail-header">
          <h3 className="chart-activity-detail-title">{label}</h3>
          <p className="doc-meta">{contributors.length} active in this window</p>
        </div>
        <ul className="chart-activity-detail-list mt-4">
          {contributors.map((contributor) => (
            <li key={contributor.login}>
              <Link
                href={buildContributorHref(contributor.login, windowPreset)}
                className="chart-activity-detail-item flex-col items-stretch gap-3 sm:flex-row sm:items-center"
              >
                <Image
                  src={contributor.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="chart-activity-detail-avatar rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-white">
                    {contributor.name ?? contributor.login}
                  </p>
                  <p className="doc-meta truncate">@{contributor.login}</p>
                </div>
                <div className="chart-activity-detail-meta text-left sm:text-right">
                  <p className="text-white">#{contributor.rank}</p>
                  <p className="doc-meta">
                    {contributor.breakdown.totalActivity} activity
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (category === "prs") {
    const items = activityDetail?.mergedPullRequests ?? [];

    return (
      <section
        aria-label={`${label} details`}
        className="chart-activity-detail-panel doc-card p-4 sm:p-5"
      >
        <div className="chart-activity-detail-header">
          <h3 className="chart-activity-detail-title">{label}</h3>
          <p className="doc-meta">{items.length} merged in this window</p>
        </div>
        {items.length === 0 ? (
          <p className="chart-empty-state mt-4">No merged pull requests in this window.</p>
        ) : (
          <ul className="chart-activity-detail-list mt-4">
            {items.map((pullRequest) => (
              <li key={pullRequest.url}>
                <Link href={pullRequest.url} className="chart-activity-detail-item flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="doc-kicker">PR #{pullRequest.number}</p>
                    <p className="mt-1 break-words text-white">{pullRequest.title}</p>
                    <p className="doc-meta mt-2">
                      {pullRequest.authorLogin ? `@${pullRequest.authorLogin}` : "Unknown author"}
                      {" · "}
                      Merged {formatTimestamp(pullRequest.mergedAt)} UTC
                    </p>
                  </div>
                  {pullRequest.closingIssueNumbers.length > 0 ? (
                    <p className="chart-activity-detail-meta doc-meta shrink-0">
                      {pullRequest.closingIssueNumbers.length} linked issue
                      {pullRequest.closingIssueNumbers.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (category === "reviews") {
    const items = activityDetail?.reviews ?? [];

    return (
      <section
        aria-label={`${label} details`}
        className="chart-activity-detail-panel doc-card p-4 sm:p-5"
      >
        <div className="chart-activity-detail-header">
          <h3 className="chart-activity-detail-title">{label}</h3>
          <p className="doc-meta">{items.length} substantive in this window</p>
        </div>
        {items.length === 0 ? (
          <p className="chart-empty-state mt-4">No substantive reviews in this window.</p>
        ) : (
          <ul className="chart-activity-detail-list mt-4">
            {items.map((review) => (
              <li key={review.reviewUrl}>
                <Link href={review.reviewUrl} className="chart-activity-detail-item flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="doc-kicker">
                      Review on PR #{review.pullRequestNumber}
                    </p>
                    <p className="mt-1 text-white">
                      {reviewStateLabel(review.state)}
                      {review.reviewerLogin ? ` by @${review.reviewerLogin}` : ""}
                    </p>
                    <p className="doc-meta mt-2">
                      Submitted {formatTimestamp(review.submittedAt)} UTC
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const items = activityDetail?.linkedIssues ?? [];

  return (
    <section
      aria-label={`${label} details`}
      className="chart-activity-detail-panel doc-card p-4 sm:p-5"
    >
      <div className="chart-activity-detail-header">
        <h3 className="chart-activity-detail-title">{label}</h3>
        <p className="doc-meta">{items.length} closed via merged PRs</p>
      </div>
      {items.length === 0 ? (
        <p className="chart-empty-state mt-4">No linked issues closed in this window.</p>
      ) : (
        <ul className="chart-activity-detail-list mt-4">
          {items.map((issue) => (
            <li key={`${issue.issueNumber}-${issue.pullRequestNumber}`}>
              <div className="chart-activity-detail-item chart-activity-detail-item-static flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="doc-kicker">Issue #{issue.issueNumber}</p>
                  <Link
                    href={`https://github.com/${repository}/issues/${issue.issueNumber}`}
                    className="doc-link mt-1 inline-block break-words text-white"
                  >
                    View issue on GitHub
                  </Link>
                  <p className="doc-meta mt-2 break-words">
                    Closed by PR #{issue.pullRequestNumber}: {issue.pullRequestTitle}
                  </p>
                </div>
                <Link
                  href={issue.pullRequestUrl}
                  className="chart-activity-detail-meta doc-link shrink-0"
                >
                  View PR
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
