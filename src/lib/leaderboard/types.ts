import type { WindowPresetId } from "./window-presets";

export type ContributorActivityBreakdown = {
  mergedPullRequests: number;
  linkedIssuesClosed: number;
  substantiveReviews: number;
  activeDays: number;
  totalActivity: number;
};

export type ContributorRecord = {
  rank: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
  breakdown: ContributorActivityBreakdown;
};

export type ContributionWindow = {
  label: string;
  start: string;
  end: string;
  days: number;
};

export type RepositoryTotals = {
  mergedPullRequests: number;
  substantiveReviews: number;
  linkedIssuesClosed: number;
  activeContributors: number;
};

export type LeaderboardSnapshot = {
  version: 2;
  generatedAt: string;
  repository: string;
  windowPreset?: WindowPresetId;
  window: ContributionWindow;
  totals: RepositoryTotals;
  contributors: ContributorRecord[];
  newContributors?: ContributorRecord[];
  methodology: {
    rankingNotes: readonly string[];
  };
};

export type ContributorDetailSnapshot = {
  repository: string;
  generatedAt: string;
  windowPreset: WindowPresetId;
  window: ContributionWindow;
  contributor: ContributorRecord;
  mergedPullRequests: RawMergedPullRequest[];
  reviews: RawReview[];
  activeDayDates: string[];
  isNewContributor: boolean;
};

export type RawMergedPullRequest = {
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  authorLogin: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  closingIssueNumbers: number[];
};

export type RawReview = {
  pullRequestNumber: number;
  pullRequestUrl: string;
  reviewUrl: string;
  submittedAt: string;
  reviewerLogin: string | null;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  state: string;
  body: string | null;
};

export type RawContributorActivity = {
  mergedPullRequests: RawMergedPullRequest[];
  reviews: RawReview[];
};
