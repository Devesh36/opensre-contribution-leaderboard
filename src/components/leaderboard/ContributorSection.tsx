import type { ContributorRecord } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
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

const TABS: Array<{
  id: ContributorView;
  label: string;
  shortLabel: string;
}> = [
  { id: "top", label: "Top contributors", shortLabel: "Top" },
  { id: "new", label: "New contributors", shortLabel: "New" },
];

export function ContributorSection({
  activeView,
  windowPreset,
  newContributors,
  topContributors,
  repository,
}: ContributorSectionProps) {
  const showNewContributors = newContributors !== undefined;
  const resolvedView =
    showNewContributors && activeView === "new" ? "new" : "top";
  const newContributorList = newContributors ?? [];

  if (!showNewContributors) {
    return (
      <div className="mt-6 space-y-6 sm:space-y-8 md:space-y-10">
        <Podium contributors={topContributors} windowPreset={windowPreset} />
        <RankingList
          contributors={topContributors}
          repository={repository}
          windowPreset={windowPreset}
        />
      </div>
    );
  }

  return (
    <section aria-label="Contributor highlights" className="space-y-6 sm:space-y-8 md:space-y-10">
      <nav className="segment-nav" aria-label="Contributor views">
        <SegmentControl aria-label="Contributor views" fullWidth>
          {TABS.map((tab) => {
            const isActive = tab.id === resolvedView;
            const count =
              tab.id === "new" ? newContributorList.length : topContributors.length;

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
                <SegmentCount>{count}</SegmentCount>
              </SegmentLink>
            );
          })}
        </SegmentControl>
      </nav>

      {resolvedView === "top" ? (
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
