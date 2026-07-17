import { PageLoadingSkeleton } from "@/components/leaderboard/PageLoadingSkeleton";

export default function Loading() {
  return (
    <div className="doc-shell">
      <main className="page-main mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <PageLoadingSkeleton variant="leaderboard" />
      </main>
    </div>
  );
}
