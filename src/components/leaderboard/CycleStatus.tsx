import type { LeaderboardSnapshot } from "@/lib/leaderboard/types";
import { getWindowCountdown } from "@/lib/leaderboard/window";
import { getWindowPresetOption } from "@/lib/leaderboard/window-presets";

type CycleStatusProps = {
  snapshot: LeaderboardSnapshot;
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function CycleStatus({ snapshot }: CycleStatusProps) {
  const countdown = getWindowCountdown(new Date(), snapshot.window);
  const presetOption = getWindowPresetOption(
    snapshot.windowPreset ?? "current-week",
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="doc-card doc-card-interactive anim-fade-in-up anim-stagger-1 p-5">
        <p className="doc-kicker">Current window</p>
        <p className="mt-3 break-words text-base text-white sm:text-lg">{snapshot.window.label}</p>
        <p className="doc-meta mt-2">{presetOption.description}</p>
      </article>

      <article className="doc-card doc-card-interactive anim-fade-in-up anim-stagger-2 p-5">
        <p className="doc-kicker">Time remaining</p>
        <p className={`mt-3 text-lg text-white${countdown.ended ? "" : " countdown-value"}`}>
          {countdown.ended
            ? "Window closed"
            : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`}
        </p>
        <p className="doc-meta mt-2">Until the next cycle boundary</p>
      </article>

      <article className="doc-card doc-card-interactive anim-fade-in-up anim-stagger-3 p-5">
        <p className="doc-kicker">Last updated</p>
        <p className="mt-3 text-lg text-white">
          {formatTimestamp(snapshot.generatedAt)}
        </p>
        <p className="doc-meta mt-2">UTC refresh timestamp</p>
      </article>

      <article className="doc-card doc-card-interactive anim-fade-in-up anim-stagger-4 p-5">
        <p className="doc-kicker">Repository totals</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="doc-meta">Merged PRs</dt>
            <dd className="text-lg text-white">{snapshot.totals.mergedPullRequests}</dd>
          </div>
          <div>
            <dt className="doc-meta">Reviews</dt>
            <dd className="text-lg text-white">{snapshot.totals.substantiveReviews}</dd>
          </div>
          <div>
            <dt className="doc-meta">Linked issues</dt>
            <dd className="text-lg text-white">{snapshot.totals.linkedIssuesClosed}</dd>
          </div>
          <div>
            <dt className="doc-meta">Contributors</dt>
            <dd className="text-lg text-white">{snapshot.totals.activeContributors}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
