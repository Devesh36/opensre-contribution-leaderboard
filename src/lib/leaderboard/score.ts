import { isBotLogin, RANKING_NOTES } from "./config";
import type {
  ContributorRecord,
  ContributorActivityBreakdown,
  LeaderboardSnapshot,
  RawContributorActivity,
  RawMergedPullRequest,
  RawReview,
  RepositoryActivityDetail,
  RepositoryLinkedIssue,
  RepositoryTotals,
} from "./types";
import type { ContributionWindow } from "./types";
import type { WindowPresetId } from "./window-presets";
import { resolveWindowForPreset } from "./window-presets";
import { isWithinWindow, toActiveDayDate } from "./window";

type ContributorAccumulator = {
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
  mergedPullRequests: RawMergedPullRequest[];
  reviews: RawReview[];
  activeDayDates: Set<string>;
};

function createAccumulator(
  login: string,
  name: string | null,
  avatarUrl: string,
): ContributorAccumulator {
  return {
    login,
    name,
    avatarUrl,
    profileUrl: `https://github.com/${login}`,
    mergedPullRequests: [],
    reviews: [],
    activeDayDates: new Set<string>(),
  };
}

function isSubstantiveReview(review: RawReview): boolean {
  if (review.state === "APPROVED" || review.state === "CHANGES_REQUESTED") {
    return true;
  }

  if (review.state === "COMMENTED") {
    const body = review.body?.trim();
    return Boolean(body && body.length >= 20);
  }

  return false;
}

function computeBreakdown(
  mergedPullRequests: RawMergedPullRequest[],
  reviews: RawReview[],
  activeDayDates: Set<string>,
): ContributorActivityBreakdown {
  const linkedIssuesClosed = mergedPullRequests.reduce(
    (total, pullRequest) => total + pullRequest.closingIssueNumbers.length,
    0,
  );

  return {
    mergedPullRequests: mergedPullRequests.length,
    linkedIssuesClosed,
    substantiveReviews: reviews.length,
    activeDays: activeDayDates.size,
    totalActivity:
      mergedPullRequests.length + reviews.length + linkedIssuesClosed,
  };
}

function compareContributors(
  left: ContributorRecord,
  right: ContributorRecord,
): number {
  if (right.breakdown.totalActivity !== left.breakdown.totalActivity) {
    return right.breakdown.totalActivity - left.breakdown.totalActivity;
  }

  if (
    right.breakdown.mergedPullRequests !== left.breakdown.mergedPullRequests
  ) {
    return (
      right.breakdown.mergedPullRequests - left.breakdown.mergedPullRequests
    );
  }

  if (
    right.breakdown.substantiveReviews !== left.breakdown.substantiveReviews
  ) {
    return (
      right.breakdown.substantiveReviews - left.breakdown.substantiveReviews
    );
  }

  if (right.breakdown.activeDays !== left.breakdown.activeDays) {
    return right.breakdown.activeDays - left.breakdown.activeDays;
  }

  return left.login.localeCompare(right.login);
}

export function extractActiveContributorLogins(
  activity: RawContributorActivity,
  window: ContributionWindow,
): string[] {
  const logins = new Set<string>();

  for (const pullRequest of activity.mergedPullRequests) {
    if (
      isWithinWindow(pullRequest.mergedAt, window) &&
      !isBotLogin(pullRequest.authorLogin) &&
      pullRequest.authorLogin
    ) {
      logins.add(pullRequest.authorLogin);
    }
  }

  for (const review of activity.reviews) {
    if (
      isWithinWindow(review.submittedAt, window) &&
      isSubstantiveReview(review) &&
      !isBotLogin(review.reviewerLogin) &&
      review.reviewerLogin
    ) {
      logins.add(review.reviewerLogin);
    }
  }

  return Array.from(logins);
}

export function buildLeaderboardSnapshot(input: {
  repository: string;
  generatedAt: string;
  windowPreset: WindowPresetId;
  window: ContributionWindow;
  activity: RawContributorActivity;
  priorContributorLogins?: Set<string>;
}): LeaderboardSnapshot {
  const contributors = new Map<string, ContributorAccumulator>();

  const ensureContributor = (
    login: string | null,
    name: string | null,
    avatarUrl: string | null,
  ): ContributorAccumulator | null => {
    if (isBotLogin(login) || !login || !avatarUrl) {
      return null;
    }

    const existing = contributors.get(login);
    if (existing) {
      if (!existing.name && name) {
        existing.name = name;
      }
      return existing;
    }

    const created = createAccumulator(login, name, avatarUrl);
    contributors.set(login, created);
    return created;
  };

  let mergedPullRequestsInWindow = 0;
  let linkedIssuesClosedInWindow = 0;
  const repositoryMergedPullRequests: RawMergedPullRequest[] = [];
  const repositoryLinkedIssues: RepositoryLinkedIssue[] = [];

  for (const pullRequest of input.activity.mergedPullRequests) {
    if (!isWithinWindow(pullRequest.mergedAt, input.window)) {
      continue;
    }

    if (!isBotLogin(pullRequest.authorLogin)) {
      mergedPullRequestsInWindow += 1;
      linkedIssuesClosedInWindow += pullRequest.closingIssueNumbers.length;
      repositoryMergedPullRequests.push(pullRequest);

      for (const issueNumber of pullRequest.closingIssueNumbers) {
        repositoryLinkedIssues.push({
          issueNumber,
          pullRequestNumber: pullRequest.number,
          pullRequestTitle: pullRequest.title,
          pullRequestUrl: pullRequest.url,
          authorLogin: pullRequest.authorLogin,
        });
      }
    }

    const contributor = ensureContributor(
      pullRequest.authorLogin,
      pullRequest.authorName,
      pullRequest.authorAvatarUrl,
    );

    if (!contributor) {
      continue;
    }

    contributor.mergedPullRequests.push(pullRequest);
    contributor.activeDayDates.add(toActiveDayDate(pullRequest.mergedAt));
  }

  const latestReviewByPullRequest = new Map<string, RawReview>();

  for (const review of input.activity.reviews) {
    if (!isWithinWindow(review.submittedAt, input.window)) {
      continue;
    }

    if (!isSubstantiveReview(review)) {
      continue;
    }

    ensureContributor(
      review.reviewerLogin,
      review.reviewerName,
      review.reviewerAvatarUrl,
    );

    const key = `${review.reviewerLogin}:${review.pullRequestNumber}`;
    const existing = latestReviewByPullRequest.get(key);

    if (!existing || review.submittedAt > existing.submittedAt) {
      latestReviewByPullRequest.set(key, review);
    }
  }

  for (const review of latestReviewByPullRequest.values()) {
    const contributor = contributors.get(review.reviewerLogin ?? "");
    if (!contributor) {
      continue;
    }

    contributor.reviews.push(review);
    contributor.activeDayDates.add(toActiveDayDate(review.submittedAt));
  }

  const contributorRecords: ContributorRecord[] = Array.from(
    contributors.values(),
  )
    .map((contributor) => ({
      rank: 0,
      login: contributor.login,
      name: contributor.name,
      avatarUrl: contributor.avatarUrl,
      profileUrl: contributor.profileUrl,
      breakdown: computeBreakdown(
        contributor.mergedPullRequests,
        contributor.reviews,
        contributor.activeDayDates,
      ),
    }))
    .filter((contributor) => contributor.breakdown.totalActivity > 0)
    .sort(compareContributors)
    .map((contributor, index) => ({
      ...contributor,
      rank: index + 1,
    }));

  const totals: RepositoryTotals = {
    mergedPullRequests: mergedPullRequestsInWindow,
    substantiveReviews: latestReviewByPullRequest.size,
    linkedIssuesClosed: linkedIssuesClosedInWindow,
    activeContributors: contributorRecords.length,
  };

  const repositoryReviews = Array.from(latestReviewByPullRequest.values()).sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );

  repositoryMergedPullRequests.sort(
    (left, right) =>
      new Date(right.mergedAt).getTime() - new Date(left.mergedAt).getTime(),
  );

  repositoryLinkedIssues.sort((left, right) => {
    if (right.issueNumber !== left.issueNumber) {
      return right.issueNumber - left.issueNumber;
    }

    return right.pullRequestNumber - left.pullRequestNumber;
  });

  const activityDetail: RepositoryActivityDetail = {
    mergedPullRequests: repositoryMergedPullRequests,
    reviews: repositoryReviews,
    linkedIssues: repositoryLinkedIssues,
  };

  const priorLogins = input.priorContributorLogins ?? new Set<string>();
  const newContributors = contributorRecords
    .filter((contributor) => !priorLogins.has(contributor.login))
    .map((contributor, index) => ({
      ...contributor,
      rank: index + 1,
    }));

  return {
    version: 2,
    generatedAt: input.generatedAt,
    repository: input.repository,
    windowPreset: input.windowPreset,
    window: input.window,
    totals,
    activityDetail,
    contributors: contributorRecords,
    newContributors,
    methodology: {
      rankingNotes: RANKING_NOTES,
    },
  };
}

export function getCurrentWindow(
  now: Date,
  preset: WindowPresetId = "current-week",
): ContributionWindow {
  return resolveWindowForPreset(now, preset);
}
