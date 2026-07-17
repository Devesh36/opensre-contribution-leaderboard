"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GIVEAWAY_DOCS_HREF } from "@/lib/giveaway/content";

type AppNavLinksProps = {
  showLeaderboard?: boolean;
  layout?: "inline" | "stacked";
  onNavigate?: () => void;
};

export function AppNavLinks({
  showLeaderboard = false,
  layout = "inline",
  onNavigate,
}: AppNavLinksProps) {
  const pathname = usePathname();
  const onBenchmarks = pathname.startsWith("/benchmarks");
  const onLeaderboard = pathname === "/" || pathname.startsWith("/contributors");
  const stacked = layout === "stacked";
  const linkClass = stacked ? "doc-nav-mobile-link" : "";

  return (
    <>
      {showLeaderboard ? (
        <Link
          href="/"
          className={`doc-button doc-button-compact ${linkClass}${onLeaderboard ? " doc-button-active" : ""}`}
          aria-current={onLeaderboard ? "page" : undefined}
          onClick={onNavigate}
        >
          Leaderboard
        </Link>
      ) : null}
      <Link
        href="/benchmarks"
        className={`doc-button doc-button-compact ${linkClass}${onBenchmarks ? " doc-button-active" : ""}`}
        aria-current={onBenchmarks ? "page" : undefined}
        onClick={onNavigate}
      >
        Benchmarks
      </Link>
      <Link
        href="https://www.opensre.com/docs"
        className={`doc-button doc-button-compact ${linkClass}`}
        onClick={onNavigate}
      >
        Docs
      </Link>
      <Link
        href="https://github.com/Tracer-Cloud/opensre"
        className={`doc-button doc-button-compact ${linkClass}`}
        onClick={onNavigate}
      >
        GitHub
      </Link>
      <Link
        href={GIVEAWAY_DOCS_HREF}
        className={`doc-button doc-button-compact doc-button-primary ${linkClass}`}
        onClick={onNavigate}
      >
        Giveaway
      </Link>
    </>
  );
}
