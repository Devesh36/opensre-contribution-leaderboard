import { LeaderboardDashboard } from "@/components/leaderboard/LeaderboardDashboard";
import { EmptyState } from "@/components/leaderboard/EmptyState";
import { ErrorState } from "@/components/leaderboard/ErrorState";
import { LeaderboardHeader } from "@/components/leaderboard/Header";
import { parseContributorView } from "@/components/leaderboard/nav";
import { WindowSelector } from "@/components/leaderboard/WindowSelector";
import {
  buildWinnerShareMetadata,
  buildWinnersTabMetadata,
} from "@/lib/giveaway/share-metadata";
import { loadLeaderboardSnapshot } from "@/lib/leaderboard/service";
import { parseWindowPreset } from "@/lib/leaderboard/window-presets";
import type { Metadata } from "next";

export const revalidate = 300;

type HomeProps = {
  searchParams: Promise<{ window?: string; view?: string; cycle?: string; winner?: string; place?: string }>;
};

export async function generateMetadata({
  searchParams,
}: HomeProps): Promise<Metadata> {
  const params = await searchParams;

  if (params.view === "winners") {
    const winnerMetadata = buildWinnerShareMetadata({
      cycle: params.cycle,
      winner: params.winner,
      place: params.place,
    });

    if (winnerMetadata) {
      return winnerMetadata;
    }

    return buildWinnersTabMetadata();
  }

  return {};
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const windowPreset = parseWindowPreset(params.window);
  const activeView = parseContributorView(params.view);
  const result = await loadLeaderboardSnapshot(windowPreset);

  return (
    <div className="doc-shell">
      <LeaderboardHeader
        source={result.source}
        windowPreset={windowPreset}
        windowLabel={result.snapshot?.window.label}
      />
      <main className="page-main mx-auto max-w-5xl space-y-6 py-6 sm:space-y-8 sm:py-8 md:space-y-10 md:py-10">
        <WindowSelector
          currentPreset={windowPreset}
          currentView={activeView}
        />

        {result.error && !result.snapshot ? (
          <ErrorState message={result.error} />
        ) : null}
        {result.snapshot ? (
          <LeaderboardDashboard
            snapshot={result.snapshot}
            activeView={activeView}
            windowPreset={windowPreset}
          />
        ) : result.error ? null : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
