/**
 * Quick verification script: fetches live data and prints a summary
 * so you can cross-check against the actual GitHub repo.
 *
 * Usage: node --env-file=.env --import tsx scripts/verify-data.ts
 */

import { fetchContributorActivity } from "../src/lib/github/client";
import { getCurrentWindow } from "../src/lib/leaderboard/score";
import { buildLeaderboardSnapshot } from "../src/lib/leaderboard/score";
import { isWithinWindow } from "../src/lib/leaderboard/window";

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.error("Set GITHUB_TOKEN or GH_TOKEN in .env");
    process.exitCode = 1;
    return;
  }

  const repository = process.env.GITHUB_REPOSITORY ?? "Tracer-Cloud/opensre";
  const now = new Date();
  const window = getCurrentWindow(now, "current-week");

  console.log("=== Data Verification ===");
  console.log(`Repository: ${repository}`);
  console.log(`Window: ${window.label}`);
  console.log(`  Start: ${window.start}`);
  console.log(`  End:   ${window.end}`);
  console.log(`  Now:   ${now.toISOString()}`);
  console.log("");

  const activity = await fetchContributorActivity({
    token,
    repository,
    windowStart: window.start,
    windowEnd: window.end,
  });

  console.log(`Raw merged PRs fetched: ${activity.mergedPullRequests.length}`);
  console.log(`Raw reviews fetched: ${activity.reviews.length}`);
  console.log("");

  // Show PRs within the window
  const validPrs = activity.mergedPullRequests.filter((pr) =>
    isWithinWindow(pr.mergedAt, window),
  );
  console.log(`PRs within window: ${validPrs.length}`);
  for (const pr of validPrs) {
    console.log(
      `  #${pr.number} by @${pr.authorLogin} — merged ${pr.mergedAt.slice(0, 10)} — "${pr.title}"`,
    );
    if (pr.closingIssueNumbers.length > 0) {
      console.log(`    Closes: ${pr.closingIssueNumbers.map((n) => `#${n}`).join(", ")}`);
    }
  }
  console.log("");

  // Show reviews within the window
  const validReviews = activity.reviews.filter((r) =>
    isWithinWindow(r.submittedAt, window),
  );
  console.log(`Reviews within window: ${validReviews.length}`);
  for (const review of validReviews) {
    console.log(
      `  @${review.reviewerLogin} on PR #${review.pullRequestNumber} — ${review.state} — ${review.submittedAt.slice(0, 10)}`,
    );
  }
  console.log("");

  // Build snapshot and show rankings
  const snapshot = buildLeaderboardSnapshot({
    repository,
    generatedAt: now.toISOString(),
    windowPreset: "current-week",
    window,
    activity,
  });

  console.log("=== Final Rankings ===");
  console.log(
    `Contributors: ${snapshot.contributors.length} | Totals: ${snapshot.totals.mergedPullRequests} PRs, ${snapshot.totals.substantiveReviews} reviews, ${snapshot.totals.linkedIssuesClosed} linked issues`,
  );
  console.log("");

  for (const contributor of snapshot.contributors) {
    console.log(
      `  #${contributor.rank} @${contributor.login} — activity: ${contributor.breakdown.totalActivity} (PRs: ${contributor.breakdown.mergedPullRequests}, reviews: ${contributor.breakdown.substantiveReviews}, issues: ${contributor.breakdown.linkedIssuesClosed}, days: ${contributor.breakdown.activeDays})`,
    );
  }

  if (snapshot.contributors.length === 0) {
    console.log("  (no contributions found in this window)");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
