import Image from "next/image";
import Link from "next/link";
import type { GiveawayCycle, GiveawayWinner } from "@/lib/giveaway/content";
import {
  giveawayWinnerAvatar,
  giveawayWinnerHref,
  giveawayWinnerLabel,
} from "@/lib/giveaway/content";
import { WinnerShareButtons } from "@/components/giveaway/WinnerShareButtons";

const PLACE_LABELS = ["1st", "2nd", "3rd"] as const;
const PLACE_KEYS = ["first", "second", "third"] as const;
const PLACE_CLASSES = [
  "giveaway-winner-place-1st",
  "giveaway-winner-place-2nd",
  "giveaway-winner-place-3rd",
] as const;

type PastWinnerCycleProps = {
  cycle: GiveawayCycle;
};

function WinnerEntry({
  cycle,
  placeIndex,
  winner,
}: {
  cycle: GiveawayCycle;
  placeIndex: number;
  winner: GiveawayWinner;
}) {
  const label = giveawayWinnerLabel(winner);
  const avatarUrl = giveawayWinnerAvatar(winner);
  const href = giveawayWinnerHref(winner);
  const placeLabel = PLACE_LABELS[placeIndex];
  const placeClass = PLACE_CLASSES[placeIndex];

  return (
    <article className="giveaway-winner-entry doc-card p-4">
      <p className={`giveaway-winner-place ${placeClass}`}>{placeLabel}</p>
      <div className="mt-3 flex items-center gap-3">
        <Link href={href} className="doc-card-interactive shrink-0 rounded-full">
          <Image
            src={avatarUrl}
            alt=""
            width={48}
            height={48}
            className="giveaway-winner-avatar h-11 w-11 rounded-full border border-[#404040]"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="giveaway-winner-name-row">
            <Link href={href} className="giveaway-winner-name min-w-0 flex-1 truncate text-sm font-medium text-white sm:text-base">
              {label}
            </Link>
            <WinnerShareButtons winner={winner} placeLabel={placeLabel} cycle={cycle} />
          </div>
          <Link href={href} className="doc-meta mt-0.5 block truncate">
            @{winner.login}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PastWinnerCycle({ cycle }: PastWinnerCycleProps) {
  const winners = PLACE_KEYS.map((key) => cycle.winners[key]);

  return (
    <section
      aria-labelledby={`giveaway-cycle-${cycle.id}`}
      className="giveaway-cycle doc-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`giveaway-cycle-${cycle.id}`} className="text-base font-medium text-white sm:text-lg">
          Cycle ending {cycle.label}
        </h3>
        <span className="contributor-badge">Announced</span>
      </div>

      <div className="interaction-group mt-4 grid gap-3 sm:grid-cols-3">
        {winners.map((winner, index) => (
          <WinnerEntry
            key={`${cycle.id}-${winner.login}`}
            cycle={cycle}
            placeIndex={index}
            winner={winner}
          />
        ))}
      </div>
    </section>
  );
}
