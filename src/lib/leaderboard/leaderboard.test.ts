import assert from "node:assert/strict";
import test from "node:test";
import { buildContributorDetail } from "./contributor-detail";
import { buildDailyActivityBuckets } from "./chart-data";
import { isBotLogin } from "./config";
import { buildLeaderboardSnapshot } from "./score";
import type { RawContributorActivity } from "./types";
import {
  getCurrentWeekWindow,
  getWindowCountdown,
  isWithinWindow,
  toActiveDayDate,
} from "./window";
import {
  parseWindowPreset,
  resolveWindowForPreset,
} from "./window-presets";

test("parseWindowPreset falls back to current week for unknown values", () => {
  assert.equal(parseWindowPreset(undefined), "current-week");
  assert.equal(parseWindowPreset("last-week"), "last-week");
  assert.equal(parseWindowPreset("invalid"), "current-week");
});

test("resolveWindowForPreset returns last week before current week", () => {
  const now = new Date("2026-07-15T12:00:00.000Z");
  const lastWeek = resolveWindowForPreset(now, "last-week");

  assert.equal(lastWeek.days, 7);
  assert.equal(lastWeek.start, "2026-07-06T00:00:00.000Z");
  assert.equal(lastWeek.end, "2026-07-12T23:59:59.999Z");
});

test("resolveWindowForPreset returns rolling windows ending at now", () => {
  const now = new Date("2026-07-15T12:00:00.000Z");
  const rolling = resolveWindowForPreset(now, "last-7-days");

  assert.equal(rolling.days, 7);
  assert.equal(rolling.end, now.toISOString());
});

test("getCurrentWeekWindow returns Monday through Sunday UTC", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  assert.equal(window.days, 7);
  assert.equal(window.start, "2026-07-13T00:00:00.000Z");
  assert.equal(window.end, "2026-07-19T23:59:59.999Z");
});

test("isWithinWindow respects inclusive boundaries", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  assert.equal(isWithinWindow(window.start, window), true);
  assert.equal(isWithinWindow(window.end, window), true);
  assert.equal(isWithinWindow("2026-07-12T23:59:59.999Z", window), false);
});

test("getWindowCountdown never returns negative values", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));
  const countdown = getWindowCountdown(new Date("2026-07-25T00:00:00.000Z"), window);

  assert.equal(countdown.ended, true);
  assert.equal(countdown.days, 0);
});

test("isBotLogin filters known automation accounts", () => {
  assert.equal(isBotLogin("dependabot[bot]"), true);
  assert.equal(isBotLogin("devesh36"), false);
});

test("buildLeaderboardSnapshot ranks by total activity", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  const activity: RawContributorActivity = {
    mergedPullRequests: [
      {
        number: 1,
        title: "Fix #42 docs update",
        url: "https://github.com/Tracer-Cloud/opensre/pull/1",
        mergedAt: "2026-07-14T10:00:00.000Z",
        authorLogin: "alice",
        authorName: "Alice",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
        closingIssueNumbers: [42],
      },
      {
        number: 2,
        title: "Feature work",
        url: "https://github.com/Tracer-Cloud/opensre/pull/2",
        mergedAt: "2026-07-14T11:00:00.000Z",
        authorLogin: "bob",
        authorName: "Bob",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/11?v=4",
        closingIssueNumbers: [],
      },
    ],
    reviews: [
      {
        pullRequestNumber: 2,
        pullRequestUrl: "https://github.com/Tracer-Cloud/opensre/pull/2",
        reviewUrl: "https://github.com/Tracer-Cloud/opensre/pull/2#review-1",
        submittedAt: "2026-07-14T12:00:00.000Z",
        reviewerLogin: "alice",
        reviewerName: "Alice",
        reviewerAvatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
        state: "APPROVED",
        body: "Looks good overall with one minor suggestion.",
      },
    ],
  };

  const snapshot = buildLeaderboardSnapshot({
    repository: "Tracer-Cloud/opensre",
    generatedAt: "2026-07-15T00:00:00.000Z",
    windowPreset: "current-week",
    window,
    activity,
  });

  assert.equal(snapshot.contributors[0]?.login, "alice");
  assert.equal(snapshot.contributors[0]?.breakdown.mergedPullRequests, 1);
  assert.equal(snapshot.contributors[0]?.breakdown.substantiveReviews, 1);
  assert.equal(snapshot.contributors[0]?.breakdown.linkedIssuesClosed, 1);
  assert.equal(snapshot.contributors[0]?.breakdown.totalActivity, 3);
  assert.equal(snapshot.contributors[1]?.login, "bob");
  assert.equal(snapshot.newContributors?.length, 2);
  assert.equal(snapshot.activityDetail?.mergedPullRequests.length, 2);
  assert.equal(snapshot.activityDetail?.reviews.length, 1);
  assert.equal(snapshot.activityDetail?.linkedIssues.length, 1);
  assert.equal(snapshot.activityDetail?.linkedIssues[0]?.issueNumber, 42);
  assert.equal(toActiveDayDate("2026-07-14T23:59:59.000Z"), "2026-07-14");
});

test("buildLeaderboardSnapshot marks returning contributors separately from new ones", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  const activity: RawContributorActivity = {
    mergedPullRequests: [
      {
        number: 1,
        title: "Alice follow-up",
        url: "https://github.com/Tracer-Cloud/opensre/pull/1",
        mergedAt: "2026-07-14T10:00:00.000Z",
        authorLogin: "alice",
        authorName: "Alice",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
        closingIssueNumbers: [],
      },
      {
        number: 2,
        title: "Bob first PR",
        url: "https://github.com/Tracer-Cloud/opensre/pull/2",
        mergedAt: "2026-07-14T11:00:00.000Z",
        authorLogin: "bob",
        authorName: "Bob",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/11?v=4",
        closingIssueNumbers: [],
      },
    ],
    reviews: [],
  };

  const snapshot = buildLeaderboardSnapshot({
    repository: "Tracer-Cloud/opensre",
    generatedAt: "2026-07-15T00:00:00.000Z",
    windowPreset: "current-week",
    window,
    activity,
    priorContributorLogins: new Set(["alice"]),
  });

  assert.equal(snapshot.newContributors?.length, 1);
  assert.equal(snapshot.newContributors?.[0]?.login, "bob");
  assert.equal(snapshot.newContributors?.[0]?.rank, 1);
});

test("buildLeaderboardSnapshot excludes bots and applies tie-breakers", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  const activity: RawContributorActivity = {
    mergedPullRequests: [
      {
        number: 3,
        title: "Bot merge",
        url: "https://github.com/Tracer-Cloud/opensre/pull/3",
        mergedAt: "2026-07-14T10:00:00.000Z",
        authorLogin: "dependabot[bot]",
        authorName: null,
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/12?v=4",
        closingIssueNumbers: [],
      },
      {
        number: 4,
        title: "Charlie change",
        url: "https://github.com/Tracer-Cloud/opensre/pull/4",
        mergedAt: "2026-07-14T11:00:00.000Z",
        authorLogin: "charlie",
        authorName: "Charlie",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/13?v=4",
        closingIssueNumbers: [],
      },
      {
        number: 5,
        title: "Delta change",
        url: "https://github.com/Tracer-Cloud/opensre/pull/5",
        mergedAt: "2026-07-14T12:00:00.000Z",
        authorLogin: "delta",
        authorName: "Delta",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/14?v=4",
        closingIssueNumbers: [],
      },
    ],
    reviews: [],
  };

  const snapshot = buildLeaderboardSnapshot({
    repository: "Tracer-Cloud/opensre",
    generatedAt: "2026-07-15T00:00:00.000Z",
    windowPreset: "current-week",
    window,
    activity,
  });

  assert.equal(
    snapshot.contributors.some((entry) => entry.login.includes("dependabot")),
    false,
  );
  assert.equal(snapshot.contributors[0]?.login, "charlie");
  assert.equal(snapshot.contributors[1]?.login, "delta");
});

test("buildContributorDetail returns activity lists for a contributor", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  const activity: RawContributorActivity = {
    mergedPullRequests: [
      {
        number: 1,
        title: "Fix #42 docs update",
        url: "https://github.com/Tracer-Cloud/opensre/pull/1",
        mergedAt: "2026-07-14T10:00:00.000Z",
        authorLogin: "alice",
        authorName: "Alice",
        authorAvatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
        closingIssueNumbers: [42],
      },
    ],
    reviews: [
      {
        pullRequestNumber: 2,
        pullRequestUrl: "https://github.com/Tracer-Cloud/opensre/pull/2",
        reviewUrl: "https://github.com/Tracer-Cloud/opensre/pull/2#review-1",
        submittedAt: "2026-07-14T12:00:00.000Z",
        reviewerLogin: "alice",
        reviewerName: "Alice",
        reviewerAvatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
        state: "APPROVED",
        body: "Looks good overall with one minor suggestion.",
      },
    ],
  };

  const detail = buildContributorDetail({
    login: "alice",
    repository: "Tracer-Cloud/opensre",
    generatedAt: "2026-07-15T00:00:00.000Z",
    windowPreset: "current-week",
    window,
    activity,
    priorContributorLogins: new Set(["alice"]),
  });

  assert.ok(detail);
  assert.equal(detail?.contributor.login, "alice");
  assert.equal(detail?.mergedPullRequests.length, 1);
  assert.equal(detail?.reviews.length, 1);
  assert.equal(detail?.isNewContributor, false);
  assert.equal(detail?.activeDayDates.length, 1);
});

test("buildDailyActivityBuckets groups activity by UTC day", () => {
  const window = getCurrentWeekWindow(new Date("2026-07-15T12:00:00.000Z"));

  const buckets = buildDailyActivityBuckets({
    window,
    mergedPullRequests: [
      { mergedAt: "2026-07-14T10:00:00.000Z" },
      { mergedAt: "2026-07-14T18:00:00.000Z" },
    ],
    reviews: [{ submittedAt: "2026-07-15T09:00:00.000Z" }],
  });

  assert.equal(buckets.length, 7);
  assert.equal(buckets.find((bucket) => bucket.date === "2026-07-14")?.count, 2);
  assert.equal(buckets.find((bucket) => bucket.date === "2026-07-15")?.reviews, 1);
});
