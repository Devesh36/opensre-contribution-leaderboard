import assert from "node:assert/strict";
import test from "node:test";
import type { ContributorRecord } from "@/lib/leaderboard/types";

const contributors: ContributorRecord[] = [
  {
    rank: 1,
    login: "alice",
    name: "Alice Example",
    avatarUrl: "https://avatars.githubusercontent.com/u/10?v=4",
    profileUrl: "https://github.com/alice",
    breakdown: {
      mergedPullRequests: 2,
      linkedIssuesClosed: 1,
      substantiveReviews: 1,
      activeDays: 2,
      totalActivity: 4,
    },
  },
  {
    rank: 2,
    login: "bob",
    name: "Bob Example",
    avatarUrl: "https://avatars.githubusercontent.com/u/11?v=4",
    profileUrl: "https://github.com/bob",
    breakdown: {
      mergedPullRequests: 1,
      linkedIssuesClosed: 0,
      substantiveReviews: 0,
      activeDays: 1,
      totalActivity: 1,
    },
  },
];

test("contributor records preserve rank ordering and searchable fields", () => {
  assert.deepEqual(
    contributors.map((contributor) => contributor.login),
    ["alice", "bob"],
  );
  assert.ok(
    contributors.some((contributor) =>
      contributor.name?.toLowerCase().includes("alice"),
    ),
  );
});
