import {
  GIVEAWAY_PAST_CYCLES,
  giveawayWinnerAvatar,
  giveawayWinnerLabel,
  type GiveawayCycle,
  type GiveawayWinner,
} from "./content";

export type WinnerSharePlace = "1st" | "2nd" | "3rd";

const WINNER_PLACE_KEYS = ["first", "second", "third"] as const;
const WINNER_PLACE_LABELS: WinnerSharePlace[] = ["1st", "2nd", "3rd"];

export const GIVEAWAY_SITE_ORIGIN =
  "https://opensre-contribution-leaderboard.vercel.app";

export function getGiveawaySiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return GIVEAWAY_SITE_ORIGIN;
}

export function buildWinnersPageUrl(origin = getGiveawaySiteOrigin()): string {
  return `${origin}/?view=winners`;
}

export function findWinnerShareContext(input: {
  cycleId: string;
  winnerLogin: string;
}): {
  cycle: GiveawayCycle;
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
} | null {
  const cycle = GIVEAWAY_PAST_CYCLES.find((entry) => entry.id === input.cycleId);
  if (!cycle) {
    return null;
  }

  const normalizedLogin = input.winnerLogin.toLowerCase();

  for (let index = 0; index < WINNER_PLACE_KEYS.length; index += 1) {
    const winner = cycle.winners[WINNER_PLACE_KEYS[index]];
    if (winner.login.toLowerCase() === normalizedLogin) {
      return {
        cycle,
        winner,
        placeLabel: WINNER_PLACE_LABELS[index],
      };
    }
  }

  return null;
}

export function buildWinnerSharePageUrl(input: {
  winner: GiveawayWinner;
  cycle: GiveawayCycle;
  placeLabel: WinnerSharePlace;
  origin?: string;
}): string {
  const origin = input.origin ?? getGiveawaySiteOrigin();
  const params = new URLSearchParams({
    view: "winners",
    cycle: input.cycle.id,
    winner: input.winner.login,
    place: input.placeLabel,
  });

  return `${origin}/?${params.toString()}`;
}

export function buildWinnerShareText(input: {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
  origin?: string;
}): string {
  const shareUrl = buildWinnerSharePageUrl(input);

  return `I won ${input.placeLabel} place on the OpenSRE bi-weekly giveaway (cycle ending ${input.cycle.label})! 🎉\n\n${shareUrl}\n\n#OpenSRE #OpenSource`;
}

export function buildWinnerLinkedInShareText(input: {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
  origin?: string;
}): string {
  const shareUrl = buildWinnerSharePageUrl(input);

  return `I won ${input.placeLabel} place on the OpenSRE bi-weekly giveaway (cycle ending ${input.cycle.label})! 🎉\n\n${shareUrl}`;
}

export function buildWinnerSharePreview(input: {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
  origin?: string;
}): {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
} {
  const label = giveawayWinnerLabel(input.winner);
  const url = buildWinnerSharePageUrl(input);

  return {
    title: `${label} won ${input.placeLabel} place | OpenSRE Bi-weekly Giveaway`,
    description: `${label} won ${input.placeLabel} place in the OpenSRE bi-weekly contributor giveaway for the cycle ending ${input.cycle.label}.`,
    url,
    imageUrl: giveawayWinnerAvatar(input.winner),
    imageAlt: `${label} — OpenSRE bi-weekly giveaway winner`,
  };
}

export function buildWinnerXShareUrl(input: {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
  origin?: string;
}): string {
  const text = buildWinnerShareText(input);
  const params = new URLSearchParams({ text });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function buildWinnerLinkedInShareUrl(input: {
  winner: GiveawayWinner;
  placeLabel: WinnerSharePlace;
  cycle: GiveawayCycle;
  origin?: string;
}): string {
  const text = buildWinnerLinkedInShareText(input);

  const params = new URLSearchParams({
    shareActive: "true",
    text,
  });

  return `https://www.linkedin.com/feed/?${params.toString()}`;
}
