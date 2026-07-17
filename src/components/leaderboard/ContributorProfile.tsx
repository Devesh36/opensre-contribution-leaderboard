import Image from "next/image";
import Link from "next/link";
import { ActivityBreakdownChart } from "@/components/leaderboard/ActivityBreakdownChart";
import { ActivityTimelineChart } from "@/components/leaderboard/ActivityTimelineChart";
import { buildContributorHref, buildLeaderboardHref } from "@/components/leaderboard/nav";
import type { ContributorDetailSnapshot } from "@/lib/leaderboard/types";

type ContributorProfileProps = {
  detail: ContributorDetailSnapshot;
};

const STAGGER_CLASSES = [
  "anim-stagger-1",
  "anim-stagger-2",
  "anim-stagger-3",
  "anim-stagger-4",
  "anim-stagger-5",
] as const;

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
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

export function ContributorProfile({ detail }: ContributorProfileProps) {
  const { contributor, mergedPullRequests, reviews, activeDayDates } = detail;
  const displayName = contributor.name ?? contributor.login;

  return (
    <div className="contributor-profile anim-fade-in space-y-6 sm:space-y-8 md:space-y-10">
      <Link
        href={buildLeaderboardHref({ window: detail.windowPreset })}
        className="doc-button inline-flex w-full justify-center sm:w-auto sm:justify-start"
      >
        ← Back to leaderboard
      </Link>

      <section className="contributor-hero doc-card p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:gap-5">
            <Image
              src={contributor.avatarUrl}
              alt={`${contributor.login} avatar`}
              width={96}
              height={96}
              className="contributor-hero-avatar h-16 w-16 shrink-0 rounded-full border border-[#404040] sm:h-20 sm:w-20 md:h-24 md:w-24"
            />
            <div className="min-w-0 w-full">
              <p className="doc-kicker">Contributor profile</p>
              <h1 className="doc-title mt-2 break-words text-2xl sm:text-3xl md:text-4xl">
                {displayName}
              </h1>
              <p className="doc-meta mt-2 break-all">@{contributor.login}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="contributor-badge">Rank #{contributor.rank}</span>
                {detail.isNewContributor ? (
                  <span className="contributor-badge contributor-badge-new">
                    New this window
                  </span>
                ) : null}
                <span className="contributor-badge break-words">
                  {detail.window.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-1">
            <Link href={contributor.profileUrl} className="doc-button justify-center">
              GitHub profile
            </Link>
            <Link
              href={`https://github.com/${detail.repository}`}
              className="doc-button justify-center"
            >
              Repository
            </Link>
          </div>
        </div>

        <dl className="interaction-group mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          <div className="contributor-stat">
            <dt className="doc-meta">Total activity</dt>
            <dd className="mt-2 text-xl text-white sm:text-2xl md:text-3xl">
              {contributor.breakdown.totalActivity}
            </dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Merged PRs</dt>
            <dd className="mt-2 text-xl text-white sm:text-2xl md:text-3xl">
              {contributor.breakdown.mergedPullRequests}
            </dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Reviews</dt>
            <dd className="mt-2 text-xl text-white sm:text-2xl md:text-3xl">
              {contributor.breakdown.substantiveReviews}
            </dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Linked issues</dt>
            <dd className="mt-2 text-xl text-white sm:text-2xl md:text-3xl">
              {contributor.breakdown.linkedIssuesClosed}
            </dd>
          </div>
          <div className="contributor-stat">
            <dt className="doc-meta">Active days</dt>
            <dd className="mt-2 text-xl text-white sm:text-2xl md:text-3xl">
              {contributor.breakdown.activeDays}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <ActivityBreakdownChart
          mergedPullRequests={contributor.breakdown.mergedPullRequests}
          substantiveReviews={contributor.breakdown.substantiveReviews}
          linkedIssuesClosed={contributor.breakdown.linkedIssuesClosed}
        />
        <ActivityTimelineChart
          window={detail.window}
          mergedPullRequests={mergedPullRequests}
          reviews={reviews}
        />
      </div>

      {activeDayDates.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="doc-section-title">Active days</h2>
            <p className="doc-meta mt-2">
              UTC days with at least one merged PR or substantive review.
            </p>
          </div>
          <div className="interaction-group flex flex-wrap gap-2">
            {activeDayDates.map((day) => (
              <span key={day} className="contributor-day">
                {formatDay(day)}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="doc-section-title">Merged pull requests</h2>
            <p className="doc-meta mt-2 break-words">
              PRs merged into {detail.repository} during this window.
            </p>
          </div>
          <p className="doc-meta">{mergedPullRequests.length} total</p>
        </div>

        {mergedPullRequests.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[#404040] px-4 py-8 text-center doc-meta">
            No merged pull requests in this window.
          </p>
        ) : (
          <ul className="interaction-group space-y-3">
            {mergedPullRequests.map((pullRequest, index) => (
              <li
                key={pullRequest.url}
                className={`activity-item anim-fade-in-up ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}`}
              >
                <article className="doc-card doc-card-interactive p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="doc-kicker">Merged PR #{pullRequest.number}</p>
                      <Link
                        href={pullRequest.url}
                        className="doc-link mt-2 block break-words text-base text-white sm:text-lg"
                      >
                        {pullRequest.title}
                      </Link>
                      <p className="doc-meta mt-2">
                        Merged {formatTimestamp(pullRequest.mergedAt)} UTC
                      </p>
                    </div>
                    {pullRequest.closingIssueNumbers.length > 0 ? (
                      <div className="shrink-0">
                        <p className="doc-meta">Linked issues</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pullRequest.closingIssueNumbers.map((issueNumber) => (
                            <Link
                              key={issueNumber}
                              href={`https://github.com/${detail.repository}/issues/${issueNumber}`}
                              className="contributor-badge"
                            >
                              #{issueNumber}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="doc-section-title">Substantive reviews</h2>
            <p className="doc-meta mt-2">
              Latest review per PR — approvals, change requests, or detailed comments.
            </p>
          </div>
          <p className="doc-meta">{reviews.length} total</p>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[#404040] px-4 py-8 text-center doc-meta">
            No substantive reviews in this window.
          </p>
        ) : (
          <ul className="interaction-group space-y-3">
            {reviews.map((review, index) => (
              <li
                key={review.reviewUrl}
                className={`activity-item anim-fade-in-up ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}`}
              >
                <article className="doc-card doc-card-interactive p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="doc-kicker">
                          Review on PR #{review.pullRequestNumber}
                        </p>
                        <span className="contributor-badge">
                          {reviewStateLabel(review.state)}
                        </span>
                      </div>
                      <Link
                        href={review.pullRequestUrl}
                        className="doc-link mt-2 inline-block break-words"
                      >
                        View pull request
                      </Link>
                      <p className="doc-meta mt-2 break-words">
                        Submitted {formatTimestamp(review.submittedAt)} UTC
                      </p>
                      {review.body ? (
                        <p className="mt-4 break-words rounded-sm border border-[#262626] bg-[#0a0a0a] p-3 text-sm leading-relaxed text-[#d4d4d4] sm:p-4">
                          {review.body.length > 280
                            ? `${review.body.slice(0, 280)}…`
                            : review.body}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={review.reviewUrl}
                      className="doc-button w-full shrink-0 justify-center sm:w-auto"
                    >
                      View review
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="doc-meta break-words">
        Snapshot generated {formatTimestamp(detail.generatedAt)} UTC ·{" "}
        <Link
          href={buildContributorHref(contributor.login, detail.windowPreset)}
          className="doc-link"
        >
          Refresh this profile
        </Link>
      </p>
    </div>
  );
}
