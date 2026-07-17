import type { Metadata } from "next";
import {
  buildWinnerSharePreview,
  findWinnerShareContext,
  getGiveawaySiteOrigin,
} from "@/lib/giveaway/share";

type WinnerShareMetadataInput = {
  cycle?: string;
  winner?: string;
  place?: string;
};

export function buildWinnerShareMetadata(
  input: WinnerShareMetadataInput,
): Metadata | null {
  if (!input.cycle || !input.winner) {
    return null;
  }

  const context = findWinnerShareContext({
    cycleId: input.cycle,
    winnerLogin: input.winner,
  });

  if (!context) {
    return null;
  }

  const placeLabel =
    input.place === "1st" || input.place === "2nd" || input.place === "3rd"
      ? input.place
      : context.placeLabel;

  const preview = buildWinnerSharePreview({
    winner: context.winner,
    cycle: context.cycle,
    placeLabel,
    origin: getGiveawaySiteOrigin(),
  });

  return {
    title: preview.title,
    description: preview.description,
    openGraph: {
      title: preview.title,
      description: preview.description,
      url: preview.url,
      siteName: "OpenSRE Contributor Leaderboard",
      type: "website",
      images: [
        {
          url: preview.imageUrl,
          alt: preview.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: preview.title,
      description: preview.description,
      images: [preview.imageUrl],
    },
  };
}

export function buildWinnersTabMetadata(): Metadata {
  const origin = getGiveawaySiteOrigin();
  const url = `${origin}/?view=winners`;
  const title = "Bi-weekly Winners | OpenSRE";
  const description =
    "Hall of fame for OpenSRE bi-weekly contributor giveaway winners.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "OpenSRE Contributor Leaderboard",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
