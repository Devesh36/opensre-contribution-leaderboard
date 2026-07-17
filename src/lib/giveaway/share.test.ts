import assert from "node:assert/strict";
import test from "node:test";
import { GIVEAWAY_PAST_CYCLES } from "./content";
import {
  buildWinnerLinkedInShareText,
  buildWinnerLinkedInShareUrl,
  buildWinnerSharePageUrl,
  buildWinnerSharePreview,
  buildWinnerShareText,
  buildWinnersPageUrl,
  buildWinnerXShareUrl,
  findWinnerShareContext,
} from "./share";

test("buildWinnersPageUrl points to the bi-weekly winners tab", () => {
  const url = buildWinnersPageUrl("https://opensre-contribution-leaderboard.vercel.app");
  assert.equal(url, "https://opensre-contribution-leaderboard.vercel.app/?view=winners");
});

test("buildWinnerSharePageUrl includes winner-specific preview params", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[0];
  const winner = cycle.winners.first;
  const url = buildWinnerSharePageUrl({
    winner,
    cycle,
    placeLabel: "1st",
    origin: "https://opensre-contribution-leaderboard.vercel.app",
  });

  assert.equal(
    url,
    "https://opensre-contribution-leaderboard.vercel.app/?view=winners&cycle=2026-06-26&winner=amsorrytola&place=1st",
  );
});

test("findWinnerShareContext resolves winner and place from cycle data", () => {
  const context = findWinnerShareContext({
    cycleId: "2026-05-15",
    winnerLogin: "AniketR10",
  });

  assert.ok(context);
  assert.equal(context?.placeLabel, "2nd");
  assert.equal(context?.winner.login, "AniketR10");
});

test("buildWinnerShareText uses first-person copy and winner share link", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[0];
  const winner = cycle.winners.first;
  const text = buildWinnerShareText({
    winner,
    placeLabel: "1st",
    cycle,
    origin: "https://opensre-contribution-leaderboard.vercel.app",
  });

  assert.match(text, /I won 1st place on the OpenSRE bi-weekly giveaway/);
  assert.match(text, /June 26, 2026/);
  assert.match(text, /winner=amsorrytola/);
  assert.match(text, /place=1st/);
  assert.match(text, /#OpenSRE/);
});

test("buildWinnerSharePreview includes avatar image for social cards", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[0];
  const winner = cycle.winners.first;
  const preview = buildWinnerSharePreview({
    winner,
    cycle,
    placeLabel: "1st",
    origin: "https://opensre-contribution-leaderboard.vercel.app",
  });

  assert.match(preview.title, /Talha won 1st place/);
  assert.match(preview.imageUrl, /avatars\.githubusercontent\.com\/u\/154398538/);
  assert.match(preview.url, /winner=amsorrytola/);
});

test("buildWinnerXShareUrl opens x.com intent with encoded text", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[1];
  const winner = cycle.winners.first;
  const url = buildWinnerXShareUrl({
    winner,
    placeLabel: "1st",
    cycle,
    origin: "https://opensre-contribution-leaderboard.vercel.app",
  });

  assert.match(url, /^https:\/\/x\.com\/intent\/tweet\?/);
  assert.match(url, /text=/);
  assert.match(url, /I\+won\+1st\+place/);
  assert.match(url, /winner%3Dkespineira/);
});

test("buildWinnerLinkedInShareText matches exact LinkedIn post copy", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[0];
  const winner = cycle.winners.first;
  const text = buildWinnerLinkedInShareText({
    winner,
    placeLabel: "1st",
    cycle,
    origin: "http://localhost:3000",
  });

  assert.equal(
    text,
    "I won 1st place on the OpenSRE bi-weekly giveaway (cycle ending June 26, 2026)! 🎉\n\nhttp://localhost:3000/?view=winners&cycle=2026-06-26&winner=amsorrytola&place=1st",
  );
});

test("buildWinnerLinkedInShareUrl opens feed composer with prefilled text", () => {
  const cycle = GIVEAWAY_PAST_CYCLES[2];
  const winner = cycle.winners.third;
  const url = buildWinnerLinkedInShareUrl({
    winner,
    placeLabel: "3rd",
    cycle,
    origin: "https://opensre-contribution-leaderboard.vercel.app",
  });

  assert.match(url, /^https:\/\/www\.linkedin\.com\/feed\/\?/);
  assert.match(url, /shareActive=true/);
  assert.match(url, /text=/);
  assert.match(url, /I(\+|%20)won(\+|%20)3rd(\+|%20)place/);
  assert.match(url, /winner%3Dyashksaini-coder/);
  assert.doesNotMatch(url, /%23OpenSRE/);
});
