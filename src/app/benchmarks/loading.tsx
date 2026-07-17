import { PageLoadingSkeleton } from "@/components/leaderboard/PageLoadingSkeleton";

export default function BenchmarksLoading() {
  return (
    <div className="doc-shell">
      <main className="page-main mx-auto max-w-5xl py-6 sm:py-8 md:py-10">
        <PageLoadingSkeleton variant="benchmarks" />
      </main>
    </div>
  );
}
