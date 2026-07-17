import Link from "next/link";
import { PastWinnerCycle } from "@/components/giveaway/PastWinnerCycle";
import {
  GIVEAWAY_LINKS,
  GIVEAWAY_PAST_CYCLES,
  GIVEAWAY_PRIZE_TIERS,
  GIVEAWAY_RULES,
} from "@/lib/giveaway/content";

export function GiveawayPanel() {
  return (
    <div className="giveaway-panel content-panel space-y-6 sm:space-y-8 md:space-y-10">
      <div className="doc-card p-3 sm:p-5">
        <p className="doc-kicker">Community giveaway</p>
        <h2 className="doc-section-title mt-3">Bi-weekly winners</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#d4d4d4] sm:text-base">
          Every two weeks the maintainer team picks three contributors from active
          participation. Announced winners from past cycles are listed below.
        </p>
        <p className="doc-meta mt-3">
          <Link
            href={GIVEAWAY_LINKS[0].href}
            className="doc-link"
            target="_blank"
            rel="noreferrer"
          >
            Read full giveaway rules
          </Link>
        </p>
      </div>

      <section aria-labelledby="giveaway-winners-heading" className="space-y-4">
        <div>
          <p className="doc-kicker">Hall of fame</p>
          <h3 id="giveaway-winners-heading" className="doc-section-title mt-2">
            Past winners
          </h3>
        </div>

        <div className="space-y-4">
          {GIVEAWAY_PAST_CYCLES.map((cycle) => (
            <PastWinnerCycle key={cycle.id} cycle={cycle} />
          ))}
        </div>
      </section>

      <section aria-labelledby="giveaway-prizes-heading" className="space-y-4">
        <div>
          <p className="doc-kicker">Rewards</p>
          <h3 id="giveaway-prizes-heading" className="doc-section-title mt-2">
            Prize tiers
          </h3>
        </div>

        <div className="interaction-group grid gap-3 sm:grid-cols-3">
          {GIVEAWAY_PRIZE_TIERS.map((tier) => (
            <article
              key={tier.place}
              className="giveaway-prize-card doc-note-card rounded-sm border border-[#262626] bg-[#0a0a0a] p-3 sm:p-4"
            >
              <p className="giveaway-prize-place">{tier.place}</p>
              <p className="mt-3 text-2xl font-medium text-white">{tier.value}</p>
              <p className="doc-meta mt-2 text-xs leading-relaxed sm:text-sm">
                {tier.reward}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="doc-card p-3 sm:p-6">
        <p className="doc-kicker">How it works</p>
        <h3 className="doc-section-title mt-3">Winner selection</h3>
        <ul className="mt-4 space-y-3 text-sm text-[#d4d4d4]">
          {GIVEAWAY_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="text-[#737373]" aria-hidden="true">
                —
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-5 space-y-2 text-sm">
          {GIVEAWAY_LINKS.slice(1).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="doc-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const GIVEAWAY_WINNERS_COUNT = GIVEAWAY_PAST_CYCLES.length;
