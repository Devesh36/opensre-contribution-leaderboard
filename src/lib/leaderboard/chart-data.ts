import type { ContributionWindow } from "./types";
import { toActiveDayDate } from "./window";

export type ChartActivityCategory = "contributors" | "prs" | "reviews" | "issues";

export type BreakdownChartItem = {
  id: ChartActivityCategory;
  label: string;
  shortLabel: string;
  value: number;
  color: string;
};

const CHART_CATEGORY_LABELS: Record<ChartActivityCategory, string> = {
  contributors: "Contributors",
  prs: "Merged PRs",
  reviews: "Reviews",
  issues: "Linked issues",
};

export function getChartCategoryLabel(category: ChartActivityCategory): string {
  return CHART_CATEGORY_LABELS[category];
}

export function isChartActivityCategory(value: string): value is ChartActivityCategory {
  return value in CHART_CATEGORY_LABELS;
}

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

export type PieChartSegment = {
  id: Extract<ChartActivityCategory, "prs" | "reviews" | "issues">;
  label: string;
  value: number;
  color: string;
  percentage: number;
  startPercent: number;
  endPercent: number;
};

export function buildRepositoryBarChartItems(totals: {
  activeContributors: number;
  mergedPullRequests: number;
  substantiveReviews: number;
  linkedIssuesClosed: number;
}): BreakdownChartItem[] {
  return [
    {
      id: "contributors",
      label: "Contributors",
      shortLabel: "People",
      value: totals.activeContributors,
      color: "#ffffff",
    },
    {
      id: "prs",
      label: "Merged PRs",
      shortLabel: "PRs",
      value: totals.mergedPullRequests,
      color: "#e5e5e5",
    },
    {
      id: "reviews",
      label: "Reviews",
      shortLabel: "Reviews",
      value: totals.substantiveReviews,
      color: "#d4d4d4",
    },
    {
      id: "issues",
      label: "Linked issues",
      shortLabel: "Issues",
      value: totals.linkedIssuesClosed,
      color: "#a3a3a3",
    },
  ];
}

export function buildRepositoryPieChartSegments(totals: {
  mergedPullRequests: number;
  substantiveReviews: number;
  linkedIssuesClosed: number;
}): PieChartSegment[] {
  const allItems = [
    {
      id: "prs" as const,
      label: "Merged PRs",
      value: totals.mergedPullRequests,
      color: "#ffffff",
    },
    {
      id: "reviews" as const,
      label: "Reviews",
      value: totals.substantiveReviews,
      color: "#d4d4d4",
    },
    {
      id: "issues" as const,
      label: "Linked issues",
      value: totals.linkedIssuesClosed,
      color: "#a3a3a3",
    },
  ];

  const items = allItems.filter((item) => item.value > 0);

  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return [];
  }

  let cursor = 0;
  return items.map((item) => {
    const percentage = (item.value / total) * 100;
    const segment: PieChartSegment = {
      ...item,
      percentage,
      startPercent: cursor,
      endPercent: cursor + percentage,
    };
    cursor += percentage;
    return segment;
  });
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
      shortLabel: "PRs",
      value: input.mergedPullRequests,
      color: "#ffffff",
    },
    {
      id: "reviews",
      label: "Reviews",
      shortLabel: "Reviews",
      value: input.substantiveReviews,
      color: "#d4d4d4",
    },
    {
      id: "issues",
      label: "Linked issues",
      shortLabel: "Issues",
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
