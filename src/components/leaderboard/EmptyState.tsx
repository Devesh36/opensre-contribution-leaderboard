import Link from "next/link";

export function EmptyState() {
  return (
    <section className="doc-callout p-4 text-center sm:p-8">
      <h2 className="doc-section-title">Leaderboard not ready</h2>
      <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-[#d4d4d4]">
        Add <code className="rounded-sm border border-[#404040] bg-[#262626] px-1.5 py-0.5 text-[13px] text-white">GITHUB_TOKEN</code>{" "}
        or <code className="rounded-sm border border-[#404040] bg-[#262626] px-1.5 py-0.5 text-[13px] text-white">GH_TOKEN</code>{" "}
        to your <code className="rounded-sm border border-[#404040] bg-[#262626] px-1.5 py-0.5 text-[13px] text-white">.env.local</code>{" "}
        to load live GitHub data for the current calendar week.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="https://github.com/Tracer-Cloud/opensre/blob/main/CONTRIBUTING.md"
          className="doc-button"
        >
          Contribution guide
        </Link>
        <Link
          href="https://github.com/Tracer-Cloud/opensre/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
          className="doc-button doc-button-primary"
        >
          Good first issues
        </Link>
      </div>
    </section>
  );
}
