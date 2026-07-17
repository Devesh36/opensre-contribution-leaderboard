import type { ContributorRecord } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import {
  GiveawayPanel,
  GIVEAWAY_WINNERS_COUNT,
} from "@/components/giveaway/GiveawayPanel";
import { buildLeaderboardHref, type ContributorView } from "./nav";
import { NewContributors } from "./NewContributors";
import { Podium } from "./Podium";
import { RankingList } from "./RankingList";
import { SegmentControl, SegmentCount, SegmentLink } from "./SegmentControl";

type ContributorSectionProps = {
  activeView: ContributorView;
  windowPreset: WindowPresetId;
  newContributors: ContributorRecord[] | undefined;
  topContributors: ContributorRecord[];
  repository: string;
};

const BASE_TABS: Array<{
  id: ContributorView;
  label: string;
  shortLabel: string;
}> = [
  { id: "top", label: "Top contributors", shortLabel: "Top" },
  { id: "new", label: "New contributors", shortLabel: "New" },
  { id: "winners", label: "Bi-weekly winners", shortLabel: "Winners" },
];

export function ContributorSection({
  activeView,
  windowPreset,
  newContributors,
  topContributors,
  repository,
}: ContributorSectionProps) {
  const showNewContributors = newContributors !== undefined;
  const tabs = showNewContributors
    ? BASE_TABS
    : BASE_TABS.filter((tab) => tab.id !== "new");

  const resolvedView =
    activeView === "winners"
      ? "winners"
      : showNewContributors && activeView === "new"
        ? "new"
        : "top";

  const newContributorList = newContributors ?? [];

  function tabCount(tabId: ContributorView): number {
    switch (tabId) {
      case "new":
        return newContributorList.length;
      case "winners":
        return GIVEAWAY_WINNERS_COUNT;
      default:
        return topContributors.length;
    }
  }

  return (
    <section aria-label="Contributor highlights" className="space-y-6 sm:space-y-8 md:space-y-10">
      <nav className="segment-nav" aria-label="Contributor views">
        <p className="scroll-hint mb-2 sm:hidden">Swipe for more views →</p>
        <SegmentControl aria-label="Contributor views" fullWidth>
          {tabs.map((tab) => {
            const isActive = tab.id === resolvedView;

            return (
              <SegmentLink
                key={tab.id}
                href={buildLeaderboardHref({
                  window: windowPreset,
                  view: tab.id,
                })}
                isActive={isActive}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <SegmentCount>{tabCount(tab.id)}</SegmentCount>
              </SegmentLink>
            );
          })}
        </SegmentControl>
      </nav>

      {resolvedView === "winners" ? (
        <GiveawayPanel />
      ) : resolvedView === "top" ? (
        <div className="content-panel space-y-6 sm:space-y-8 md:space-y-10">
          <Podium contributors={topContributors} embedded windowPreset={windowPreset} />
          <RankingList
            contributors={topContributors}
            repository={repository}
            windowPreset={windowPreset}
            title="Full ranking"
            searchPlaceholder="Search all contributors"
          />
        </div>
      ) : (
        <div className="content-panel space-y-6 sm:space-y-8 md:space-y-10">
          <NewContributors
            contributors={newContributorList}
            embedded
            windowPreset={windowPreset}
          />
          <RankingList
            contributors={newContributorList}
            repository={repository}
            windowPreset={windowPreset}
            title="Full ranking — new contributors"
            searchPlaceholder="Search new contributors"
            emptyMessage="No new contributors match your search."
          />
        </div>
      )}
    </section>
  );
}
