"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buildContributorHref } from "@/components/leaderboard/nav";
import type { ContributorRecord } from "@/lib/leaderboard/types";
import type { WindowPresetId } from "@/lib/leaderboard/window-presets";

type RankingListProps = {
  contributors: ContributorRecord[];
  repository: string;
  windowPreset: WindowPresetId;
  title?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
};

function githubSearchUrl(repository: string, query: string): string {
  return `https://github.com/search?q=${encodeURIComponent(`repo:${repository} ${query}`)}`;
}

function ContributorDetails({
  contributor,
  detailHref,
  repository,
}: {
  contributor: ContributorRecord;
  detailHref: string;
  repository: string;
}) {
  return (
    <details className="mt-4 rounded-sm border border-[#262626] bg-[#0a0a0a] p-4">
      <summary className="cursor-pointer text-sm text-[#d4d4d4]">
        View activity breakdown
      </summary>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="doc-meta">Merged PRs</dt>
          <dd className="text-white">{contributor.breakdown.mergedPullRequests}</dd>
        </div>
        <div>
          <dt className="doc-meta">Linked issues closed</dt>
          <dd className="text-white">{contributor.breakdown.linkedIssuesClosed}</dd>
        </div>
        <div>
          <dt className="doc-meta">Reviews</dt>
          <dd className="text-white">{contributor.breakdown.substantiveReviews}</dd>
        </div>
        <div>
          <dt className="doc-meta">Active days</dt>
          <dd className="text-white">{contributor.breakdown.activeDays}</dd>
        </div>
        <div>
          <dt className="doc-meta">Total activity</dt>
          <dd className="font-medium text-white">
            {contributor.breakdown.totalActivity}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href={detailHref} className="doc-link">
          Full contribution details
        </Link>
        <Link
          href={githubSearchUrl(
            repository,
            `is:pr is:merged author:${contributor.login}`,
          )}
          className="doc-link"
          onClick={(event) => event.stopPropagation()}
        >
          Merged PRs on GitHub
        </Link>
        <Link
          href={githubSearchUrl(
            repository,
            `is:pr reviewed-by:${contributor.login}`,
          )}
          className="doc-link"
          onClick={(event) => event.stopPropagation()}
        >
          Reviews on GitHub
        </Link>
      </div>
    </details>
  );
}

export function RankingList({
  contributors,
  repository,
  windowPreset,
  title = "Full ranking",
  emptyMessage = "No contributors match your search.",
  searchPlaceholder = "Search by login or display name",
}: RankingListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return contributors;
    }

    return contributors.filter((contributor) => {
      return (
        contributor.login.toLowerCase().includes(normalized) ||
        contributor.name?.toLowerCase().includes(normalized)
      );
    });
  }, [contributors, query]);

  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="doc-section-title">{title}</h2>
        <label className="flex w-full max-w-md flex-col gap-2 text-sm sm:items-end">
          <span className="doc-meta">Search contributors</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-sm border border-[#404040] bg-[#0a0a0a] px-4 py-2 text-white outline-none focus:border-[#737373]"
          />
        </label>
      </div>

      <div className="hidden overflow-x-auto rounded-sm border border-[#262626] md:block">
        <table className="doc-table doc-table-ranking min-w-[42rem] text-left text-sm">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Contributor</th>
              <th scope="col">Activity</th>
              <th scope="col">PRs</th>
              <th scope="col">Reviews</th>
              <th scope="col">Issues</th>
              <th scope="col">Active days</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((contributor) => {
              const detailHref = buildContributorHref(
                contributor.login,
                windowPreset,
              );

              return (
                <tr
                  key={contributor.login}
                  className="ranking-row"
                  tabIndex={0}
                  role="link"
                  aria-label={`View contribution details for ${contributor.name ?? contributor.login}`}
                  onClick={() => router.push(detailHref)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(detailHref);
                    }
                  }}
                >
                  <td className="font-medium text-white">#{contributor.rank}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Image
                        src={contributor.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-white">
                          {contributor.name ?? contributor.login}
                        </p>
                        <p className="doc-meta">@{contributor.login}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-white">
                    {contributor.breakdown.totalActivity}
                  </td>
                  <td className="text-[#d4d4d4]">
                    {contributor.breakdown.mergedPullRequests}
                  </td>
                  <td className="text-[#d4d4d4]">
                    {contributor.breakdown.substantiveReviews}
                  </td>
                  <td className="text-[#d4d4d4]">
                    {contributor.breakdown.linkedIssuesClosed}
                  </td>
                  <td className="text-[#d4d4d4]">
                    {contributor.breakdown.activeDays}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {filtered.map((contributor) => {
          const detailHref = buildContributorHref(
            contributor.login,
            windowPreset,
          );

          return (
            <article key={contributor.login} className="doc-card p-4">
              <Link
                href={detailHref}
                className="contributor-card-link doc-card-interactive -m-4 block rounded-sm p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="doc-meta">#{contributor.rank}</span>
                  <Image
                    src={contributor.avatarUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="block truncate text-white">
                      {contributor.name ?? contributor.login}
                    </p>
                    <p className="doc-meta truncate">@{contributor.login}</p>
                  </div>
                  <p className="text-lg text-white">
                    {contributor.breakdown.totalActivity}
                  </p>
                </div>
                <p className="contributor-card-cta doc-meta mt-3">
                  View contribution details →
                </p>
              </Link>
              <ContributorDetails
                contributor={contributor}
                detailHref={detailHref}
                repository={repository}
              />
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-sm border border-dashed border-[#404040] px-4 py-8 text-center doc-meta">
          {contributors.length === 0
            ? "No contributors in this view yet."
            : emptyMessage}
        </p>
      ) : null}
    </section>
  );
}
