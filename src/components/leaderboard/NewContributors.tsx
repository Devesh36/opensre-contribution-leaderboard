import type { ContributorRecord } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import { Podium } from "./Podium";

type NewContributorsProps = {
  contributors: ContributorRecord[];
  embedded?: boolean;
  windowPreset?: WindowPresetId;
};

export function NewContributors({
  contributors,
  embedded = false,
  windowPreset,
}: NewContributorsProps) {
  return (
    <section
      aria-labelledby="new-contributors-heading"
      className={embedded ? "px-1" : "space-y-4"}
    >
      {!embedded ? (
        <div>
          <p className="doc-kicker">First-time contributors</p>
          <h2 id="new-contributors-heading" className="doc-section-title mt-2">
            New contributors
          </h2>
          <p className="doc-meta mt-2 max-w-3xl">
            People contributing to the repository for the first time during this
            window.
          </p>
        </div>
      ) : (
        <h2 id="new-contributors-heading" className="sr-only">
          New contributors
        </h2>
      )}

      <Podium
        contributors={contributors}
        embedded={embedded}
        windowPreset={windowPreset}
        title="Top new contributors"
        subtitle="Highest activity this window"
        emptyMessage="No first-time contributors in this window."
        ariaLabel="Top new contributors podium"
      />
    </section>
  );
}
