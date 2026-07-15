import type { LeaderboardSnapshot } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import type { ContributorView } from "./nav";
import { ContributorSection } from "./ContributorSection";
import { CycleStatus } from "./CycleStatus";
import { Methodology } from "./Methodology";
import { RepositoryTotalsChart } from "./RepositoryTotalsChart";

type LeaderboardDashboardProps = {
  snapshot: LeaderboardSnapshot;
  activeView: ContributorView;
  windowPreset: WindowPresetId;
};

export function LeaderboardDashboard({
  snapshot,
  activeView,
  windowPreset,
}: LeaderboardDashboardProps) {
  return (
    <div className="anim-fade-in space-y-6 sm:space-y-8 md:space-y-10">
      <CycleStatus snapshot={snapshot} />

      <RepositoryTotalsChart totals={snapshot.totals} />

      <ContributorSection
        activeView={activeView}
        windowPreset={windowPreset}
        newContributors={snapshot.newContributors}
        topContributors={snapshot.contributors}
        repository={snapshot.repository}
      />

      <Methodology snapshot={snapshot} />
    </div>
  );
}
