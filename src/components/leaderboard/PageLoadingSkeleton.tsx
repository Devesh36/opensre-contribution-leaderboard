type PageLoadingSkeletonProps = {
  variant?: "leaderboard" | "contributor";
};

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`loading-skeleton ${className}`} aria-hidden="true" />;
}

export function PageLoadingSkeleton({
  variant = "leaderboard",
}: PageLoadingSkeletonProps) {
  if (variant === "contributor") {
    return (
      <div className="loading-page space-y-6 sm:space-y-8 md:space-y-10" aria-busy="true">
        <SkeletonBlock className="h-10 w-full max-w-[12rem] rounded-sm" />
        <section className="doc-card space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <SkeletonBlock className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-8 w-3/4 max-w-xs" />
              <SkeletonBlock className="h-4 w-32" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-7 w-20" />
                <SkeletonBlock className="h-7 w-28" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-sm" />
            ))}
          </div>
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonBlock className="h-56 rounded-sm" />
          <SkeletonBlock className="h-56 rounded-sm" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-24 rounded-sm" />
          <SkeletonBlock className="h-24 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="loading-page space-y-6 sm:space-y-8 md:space-y-10" aria-busy="true">
      <SkeletonBlock className="h-28 rounded-sm" />
      <SkeletonBlock className="h-36 rounded-sm" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-28 rounded-sm" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-44 rounded-sm" />
        ))}
      </div>
      <SkeletonBlock className="h-80 rounded-sm" />
    </div>
  );
}
