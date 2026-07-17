export type GiveawayWinner = {
  /** Canonical GitHub login for contributor links. */
  login: string;
  /** Numeric GitHub user id from the public profile API. */
  githubId: number;
  displayName?: string;
  avatarUrl?: string;
};

export type GiveawayCycle = {
  id: string;
  label: string;
  announcedOn: string;
  winners: {
    first: GiveawayWinner;
    second: GiveawayWinner;
    third: GiveawayWinner;
  };
};

export type GiveawayPrizeTier = {
  place: string;
  reward: string;
  value: string;
};

export const GIVEAWAY_PRIZE_TIERS: GiveawayPrizeTier[] = [
  {
    place: "1st",
    reward: "Amazon gift card + OpenSRE merch bundle",
    value: "$50",
  },
  {
    place: "2nd",
    reward: "Amazon gift card + OpenSRE merch bundle",
    value: "$35",
  },
  {
    place: "3rd",
    reward: "Amazon gift card + OpenSRE merch bundle",
    value: "$25",
  },
];

export const GIVEAWAY_RULES = [
  "Contribute within the active two-week window.",
  "Winners are chosen by the maintainer team — not purely by rank.",
  "Both volume and quality matter; one win per person per month.",
  "Merged PRs, reviews, docs, and resolved issues all count.",
] as const;

export const GIVEAWAY_DOCS_HREF =
  "https://www.opensre.com/docs/bi-weekly-giveaway" as const;

export const GIVEAWAY_LINKS = [
  {
    label: "Full giveaway rules",
    href: GIVEAWAY_DOCS_HREF,
  },
  {
    label: "Good first issues",
    href: "https://github.com/Tracer-Cloud/opensre/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
  },
  {
    label: "Help wanted",
    href: "https://github.com/Tracer-Cloud/opensre/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22",
  },
  {
    label: "Winner announcements",
    href: GIVEAWAY_DOCS_HREF,
  },
] as const;

/** Published cycles — logins, ids, and avatars verified against GitHub profiles. */
export const GIVEAWAY_PAST_CYCLES: GiveawayCycle[] = [
  {
    id: "2026-06-26",
    label: "June 26, 2026",
    announcedOn: "2026-06-26",
    winners: {
      first: {
        login: "amsorrytola",
        githubId: 154398538,
        displayName: "Talha",
        avatarUrl: "https://avatars.githubusercontent.com/u/154398538?v=4",
      },
      second: {
        login: "Ndukiye",
        githubId: 110042947,
        displayName: "Orukaria Ndukiye",
        avatarUrl: "https://avatars.githubusercontent.com/u/110042947?v=4",
      },
      third: {
        login: "kasulani",
        githubId: 6205925,
        avatarUrl: "https://avatars.githubusercontent.com/u/6205925?v=4",
      },
    },
  },
  {
    id: "2026-05-15",
    label: "May 15, 2026",
    announcedOn: "2026-05-15",
    winners: {
      first: {
        login: "kespineira",
        githubId: 44882187,
        displayName: "Kevin Espiñeira",
        avatarUrl: "https://avatars.githubusercontent.com/u/44882187?v=4",
      },
      second: {
        login: "AniketR10",
        githubId: 169879837,
        displayName: "Aniket Rawat",
        avatarUrl: "https://avatars.githubusercontent.com/u/169879837?v=4",
      },
      third: {
        login: "cerencamkiran",
        githubId: 150190567,
        displayName: "Ceren Camkiran",
        avatarUrl: "https://avatars.githubusercontent.com/u/150190567?v=4",
      },
    },
  },
  {
    id: "2026-05-02",
    label: "May 2, 2026",
    announcedOn: "2026-05-02",
    winners: {
      first: {
        login: "muddlebee",
        githubId: 8139783,
        displayName: "Anwesh",
        avatarUrl: "https://avatars.githubusercontent.com/u/8139783?v=4",
      },
      second: {
        login: "Davidson3556",
        githubId: 99369614,
        displayName: "Awokoya Olawale Davidson",
        avatarUrl: "https://avatars.githubusercontent.com/u/99369614?v=4",
      },
      third: {
        login: "yashksaini-coder",
        githubId: 115717039,
        displayName: "Yash Kumar Saini",
        avatarUrl: "https://avatars.githubusercontent.com/u/115717039?v=4",
      },
    },
  },
];

export function giveawayWinnerLabel(winner: GiveawayWinner): string {
  return winner.displayName ?? winner.login;
}

export function giveawayWinnerAvatar(winner: GiveawayWinner): string {
  return (
    winner.avatarUrl ??
    `https://avatars.githubusercontent.com/u/${winner.githubId}?v=4`
  );
}

export function giveawayWinnerHref(winner: GiveawayWinner): string {
  return `/contributors/${encodeURIComponent(winner.login)}`;
}

export function giveawayWinnerGitHubHref(winner: GiveawayWinner): string {
  return `https://github.com/${winner.login}`;
}
