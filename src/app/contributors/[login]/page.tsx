import type { Metadata } from "next";
import Link from "next/link";
import { ContributorProfile } from "@/components/leaderboard/ContributorProfile";
import { ErrorState } from "@/components/leaderboard/ErrorState";
import { SiteNavBar } from "@/components/leaderboard/SiteNavBar";
import { buildLeaderboardHref } from "@/components/leaderboard/nav";
import { loadContributorDetail } from "@/lib/leaderboard/service";
import { parseWindowPreset } from "@/lib/leaderboard/window-presets";

export const revalidate = 300;

type ContributorPageProps = {
  params: Promise<{ login: string }>;
  searchParams: Promise<{ window?: string }>;
};

export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { login } = await params;

  return {
    title: `${login} | Contributor Leaderboard | OpenSRE`,
    description: `Contribution activity for @${login} on Tracer-Cloud/opensre.`,
  };
}

export default async function ContributorPage({
  params,
  searchParams,
}: ContributorPageProps) {
  const [{ login }, query] = await Promise.all([params, searchParams]);
  const windowPreset = parseWindowPreset(query.window);
  const result = await loadContributorDetail(login, windowPreset);

  return (
    <div className="doc-shell">
      <header className="doc-nav">
        <SiteNavBar homeHref={buildLeaderboardHref({ window: windowPreset })}>
          <Link
            href={buildLeaderboardHref({ window: windowPreset })}
            className="doc-button doc-button-compact"
          >
            Leaderboard
          </Link>
          <Link href="https://www.opensre.com/docs" className="doc-button doc-button-compact">
            Docs
          </Link>
        </SiteNavBar>
      </header>

      <main className="page-main mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        {result.error && !result.detail ? (
          <ErrorState message={result.error} />
        ) : null}
        {result.detail ? <ContributorProfile detail={result.detail} /> : null}
      </main>
    </div>
  );
}
