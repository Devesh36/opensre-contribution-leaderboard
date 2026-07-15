import type { LeaderboardSnapshot } from "@/lib/leaderboard/types";

type MethodologyProps = {
  snapshot: LeaderboardSnapshot;
};

export function Methodology({ snapshot }: MethodologyProps) {
  return (
    <section aria-labelledby="methodology-heading" className="doc-card p-6">
      <p className="doc-kicker">How ranking works</p>
      <h2 id="methodology-heading" className="doc-section-title mt-3">
        Activity-based ranking
      </h2>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {snapshot.methodology.rankingNotes.map((note) => (
          <li
            key={note}
            className="rounded-sm border border-[#262626] bg-[#0a0a0a] p-4 text-sm text-[#d4d4d4]"
          >
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}
