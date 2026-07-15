import type { ContributionWindow } from "./types";
import { toActiveDayDate } from "./window";

export type BreakdownChartItem = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type DailyActivityBucket = {
  date: string;
  label: string;
  count: number;
  prs: number;
  reviews: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00.000Z`);
}

function shortDayLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}

export function buildBreakdownChartItems(input: {
  mergedPullRequests: number;
  substantiveReviews: number;
  linkedIssuesClosed: number;
}): BreakdownChartItem[] {
  return [
    {
      id: "prs",
      label: "Merged PRs",
      value: input.mergedPullRequests,
      color: "#ffffff",
    },
    {
      id: "reviews",
      label: "Reviews",
      value: input.substantiveReviews,
      color: "#d4d4d4",
    },
    {
      id: "issues",
      label: "Linked issues",
      value: input.linkedIssuesClosed,
      color: "#a3a3a3",
    },
  ];
}

export function buildDailyActivityBuckets(input: {
  window: ContributionWindow;
  mergedPullRequests: Array<{ mergedAt: string }>;
  reviews: Array<{ submittedAt: string }>;
}): DailyActivityBucket[] {
  const startDate = toActiveDayDate(input.window.start);
  const endDate = toActiveDayDate(input.window.end);
  const buckets = new Map<string, DailyActivityBucket>();

  for (
    let cursor = utcDayStart(startDate);
    cursor <= utcDayStart(endDate);
    cursor += DAY_MS
  ) {
    const date = new Date(cursor).toISOString().slice(0, 10);
    buckets.set(date, {
      date,
      label: shortDayLabel(date),
      count: 0,
      prs: 0,
      reviews: 0,
    });
  }

  for (const pullRequest of input.mergedPullRequests) {
    const date = toActiveDayDate(pullRequest.mergedAt);
    const bucket = buckets.get(date);
    if (!bucket) {
      continue;
    }

    bucket.prs += 1;
    bucket.count += 1;
  }

  for (const review of input.reviews) {
    const date = toActiveDayDate(review.submittedAt);
    const bucket = buckets.get(date);
    if (!bucket) {
      continue;
    }

    bucket.reviews += 1;
    bucket.count += 1;
  }

  return Array.from(buckets.values());
}

export function maxBreakdownValue(items: BreakdownChartItem[]): number {
  return Math.max(1, ...items.map((item) => item.value));
}

export function maxDailyActivity(buckets: DailyActivityBucket[]): number {
  return Math.max(1, ...buckets.map((bucket) => bucket.count));
}
