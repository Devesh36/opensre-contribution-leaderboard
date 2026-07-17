import type { GitHubUserProfile } from "../github/client";
import { computeBreakdown, buildLeaderboardSnapshot } from "./score";
import type {
  ContributionWindow,
  ContributorDetailSnapshot,
  RawContributorActivity,
  RawMergedPullRequest,
  RawReview,
} from "./types";
import type { WindowPresetId } from "./window-presets";
import { isWithinWindow, toActiveDayDate } from "./window";
import { isBotLogin } from "./config";

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

function extractContributorItems(
  activity: RawContributorActivity,
  window: ContributionWindow,
  login: string,
): {
  mergedPullRequests: RawMergedPullRequest[];
  reviews: RawReview[];
  activeDayDates: string[];
} {
  const normalizedLogin = login.toLowerCase();
  const mergedPullRequests: RawMergedPullRequest[] = [];
  const reviews: RawReview[] = [];
  const activeDayDates = new Set<string>();
  const latestReviewByPullRequest = new Map<string, RawReview>();

  for (const pullRequest of activity.mergedPullRequests) {
    if (!isWithinWindow(pullRequest.mergedAt, window)) {
      continue;
    }

    if (pullRequest.authorLogin?.toLowerCase() !== normalizedLogin) {
      continue;
    }

    mergedPullRequests.push(pullRequest);
    activeDayDates.add(toActiveDayDate(pullRequest.mergedAt));
  }

  for (const review of activity.reviews) {
    if (!isWithinWindow(review.submittedAt, window)) {
      continue;
    }

    if (!isSubstantiveReview(review)) {
      continue;
    }

    if (review.reviewerLogin?.toLowerCase() !== normalizedLogin) {
      continue;
    }

    const key = `${review.reviewerLogin}:${review.pullRequestNumber}`;
    const existing = latestReviewByPullRequest.get(key);

    if (!existing || review.submittedAt > existing.submittedAt) {
      latestReviewByPullRequest.set(key, review);
    }
  }

  for (const review of latestReviewByPullRequest.values()) {
    reviews.push(review);
    activeDayDates.add(toActiveDayDate(review.submittedAt));
  }

  mergedPullRequests.sort(
    (left, right) =>
      new Date(right.mergedAt).getTime() - new Date(left.mergedAt).getTime(),
  );
  reviews.sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() -
      new Date(left.submittedAt).getTime(),
  );

  return {
    mergedPullRequests,
    reviews,
    activeDayDates: Array.from(activeDayDates).sort().reverse(),
  };
}

export function buildContributorDetail(input: {
  login: string;
  repository: string;
  generatedAt: string;
  windowPreset: WindowPresetId;
  window: ContributionWindow;
  activity: RawContributorActivity;
  priorContributorLogins?: Set<string>;
  githubProfile?: GitHubUserProfile | null;
}): ContributorDetailSnapshot | null {
  if (isBotLogin(input.login)) {
    return null;
  }

  const snapshot = buildLeaderboardSnapshot({
    repository: input.repository,
    generatedAt: input.generatedAt,
    windowPreset: input.windowPreset,
    window: input.window,
    activity: input.activity,
    priorContributorLogins: input.priorContributorLogins,
  });

  const rankedContributor = snapshot.contributors.find((record) => {
    const recordLogin = record.login.toLowerCase();
    return (
      recordLogin === input.login.toLowerCase() ||
      recordLogin === input.githubProfile?.login.toLowerCase()
    );
  });

  const canonicalLogin =
    rankedContributor?.login ??
    input.githubProfile?.login ??
    input.login;

  const { mergedPullRequests, reviews, activeDayDates } =
    extractContributorItems(input.activity, input.window, canonicalLogin);

  const breakdown = computeBreakdown(
    mergedPullRequests,
    reviews,
    activeDayDates,
  );

  const contributor = rankedContributor
    ? {
        ...rankedContributor,
        breakdown,
      }
    : input.githubProfile
      ? {
          rank: 0,
          login: input.githubProfile.login,
          name: input.githubProfile.name,
          avatarUrl: input.githubProfile.avatarUrl,
          profileUrl: input.githubProfile.profileUrl,
          breakdown,
        }
      : null;

  if (!contributor) {
    return null;
  }

  return {
    repository: input.repository,
    generatedAt: input.generatedAt,
    windowPreset: input.windowPreset,
    window: input.window,
    contributor,
    mergedPullRequests,
    reviews,
    activeDayDates,
    isNewContributor: !(
      input.priorContributorLogins?.has(contributor.login) ?? false
    ),
  };
}
