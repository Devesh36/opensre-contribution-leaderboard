import Image from "next/image";
import Link from "next/link";
import type { ContributorRecord } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";
import { buildContributorHref } from "./nav";

type PodiumProps = {
  contributors: ContributorRecord[];
  embedded?: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  windowPreset?: WindowPresetId;
};

const rankLabels = ["1st", "2nd", "3rd"];
const podiumRankClasses = ["podium-card-1st", "podium-card-2nd", "podium-card-3rd"];

const desktopPodiumStyles = [
  "md:order-2 md:mt-0",
  "md:order-1 md:-mt-4",
  "md:order-3 md:mt-6",
];

function PodiumCard({
  contributor,
  rankIndex,
  layoutClassName,
  windowPreset,
}: {
  contributor: ContributorRecord;
  rankIndex: number;
  layoutClassName: string;
  windowPreset?: WindowPresetId;
}) {
  const cardClassName = `contributor-card-link doc-card doc-card-interactive podium-card ${podiumRankClasses[rankIndex] ?? ""} p-4 sm:p-6 ${layoutClassName}`;
  const detailHref = windowPreset
    ? buildContributorHref(contributor.login, windowPreset)
    : null;

  const cardContent = (
    <>
      <p className="doc-kicker">{rankLabels[rankIndex]}</p>
      <div className="mt-4 flex items-center gap-3 sm:gap-4">
        <Image
          src={contributor.avatarUrl}
          alt={`${contributor.login} avatar`}
          width={64}
          height={64}
          className="podium-avatar h-12 w-12 shrink-0 rounded-full border border-[#404040] sm:h-16 sm:w-16"
        />
        <div className="min-w-0">
          <p className="truncate text-base text-white transition-colors group-hover:text-[#f5f5f5] sm:text-lg">
            {contributor.name ?? contributor.login}
          </p>
          <p className="doc-meta truncate">@{contributor.login}</p>
        </div>
      </div>
      <p className="mt-5 text-2xl text-white sm:mt-6 sm:text-3xl">
        {contributor.breakdown.totalActivity}
        <span className="doc-meta ml-2 text-sm">activities</span>
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="doc-meta">Merged PRs</dt>
          <dd className="text-white">{contributor.breakdown.mergedPullRequests}</dd>
        </div>
        <div>
          <dt className="doc-meta">Reviews</dt>
          <dd className="text-white">{contributor.breakdown.substantiveReviews}</dd>
        </div>
      </dl>
      {detailHref ? (
        <p className="contributor-card-cta doc-meta mt-4 sm:mt-5">
          View contribution details →
        </p>
      ) : null}
    </>
  );

  if (detailHref) {
    return (
      <Link href={detailHref} className={`${cardClassName} group block`}>
        {cardContent}
      </Link>
    );
  }

  return <article className={cardClassName}>{cardContent}</article>;
}

export function Podium({
  contributors,
  embedded = false,
  title = "Top contributors",
  subtitle = "By total activity",
  emptyMessage = "No contributor activity in this window yet.",
  ariaLabel = "Top contributors podium",
  windowPreset,
}: PodiumProps) {
  const topThree = contributors.slice(0, 3);

  if (topThree.length === 0) {
    return (
      <section aria-label={ariaLabel} className="space-y-4 px-1">
        <h2 className="doc-section-title">{title}</h2>
        <p className="rounded-sm border border-dashed border-[#404040] px-4 py-8 text-center doc-meta">
          {emptyMessage}
        </p>
      </section>
    );
  }

  const desktopOrdered =
    topThree.length === 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;

  return (
    <section
      aria-label={ariaLabel}
      className={embedded ? "space-y-4 px-1" : "space-y-4"}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className="doc-section-title">{title}</h2>
        <p className="doc-meta">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:hidden">
        {topThree.map((contributor, rankIndex) => (
          <PodiumCard
            key={contributor.login}
            contributor={contributor}
            rankIndex={rankIndex}
            layoutClassName=""
            windowPreset={windowPreset}
          />
        ))}
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {desktopOrdered.map((contributor, index) => {
          const rankIndex =
            topThree.length === 3
              ? index === 0
                ? 1
                : index === 1
                  ? 0
                  : 2
              : index;

          return (
            <PodiumCard
              key={contributor.login}
              contributor={contributor}
              rankIndex={rankIndex}
              layoutClassName={desktopPodiumStyles[index] ?? ""}
              windowPreset={windowPreset}
            />
          );
        })}
      </div>
    </section>
  );
}
