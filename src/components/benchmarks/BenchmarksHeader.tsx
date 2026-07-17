import Link from "next/link";
import { SiteNavBar } from "@/components/leaderboard/SiteNavBar";

export function BenchmarksHeader() {
  return (
    <header className="doc-nav">
      <SiteNavBar showLeaderboard />

      <div className="page-hero benchmark-page-hero mx-auto max-w-5xl space-y-3 px-4 pb-5 pt-3 sm:space-y-4 sm:px-6 sm:pb-8 sm:pt-2">
        <div className="benchmark-page-hero-glow" aria-hidden="true" />
        <p className="doc-kicker anim-fade-in-up anim-stagger-1">Evaluation</p>
        <h1 className="doc-title anim-fade-in-up anim-stagger-2">OpenSRE Benchmarks</h1>
        <p className="doc-subtitle anim-fade-in-up anim-stagger-3 max-w-3xl">
          Reproducible evaluation for AI SRE agents — measuring incident
          investigation quality on curated fault scenarios across{" "}
          <Link
            href="https://github.com/Tracer-Cloud/opensre"
            className="doc-link break-words"
          >
            Tracer-Cloud/opensre
          </Link>
          .
        </p>
        <p className="doc-meta anim-fade-in-up anim-stagger-4 max-w-3xl">
          Looking for contributor activity instead?{" "}
          <Link href="/" className="doc-link">
            Return to the leaderboard
          </Link>
          .
        </p>
      </div>
    </header>
  );
}
