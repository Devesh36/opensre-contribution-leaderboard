import Link from "next/link";
import type { LeaderboardSource } from "@/lib/leaderboard/service";
import {
  getWindowPresetOption,
  type WindowPresetId,
} from "@/lib/leaderboard/window-presets";
import { SiteNavBar } from "./SiteNavBar";

type LeaderboardHeaderProps = {
  source: LeaderboardSource;
  windowPreset: WindowPresetId;
  windowLabel?: string;
};

export function LeaderboardHeader({
  source,
  windowPreset,
  windowLabel,
}: LeaderboardHeaderProps) {
  const presetOption = getWindowPresetOption(windowPreset);

  return (
    <header className="doc-nav">
      <SiteNavBar />

      <div className="page-hero mx-auto max-w-5xl space-y-3 px-4 pb-6 pt-4 sm:space-y-4 sm:px-6 sm:pb-8 sm:pt-2">
        <p className="doc-kicker anim-fade-in-up anim-stagger-1">Community</p>
        <h1 className="doc-title anim-fade-in-up anim-stagger-2">Contributor Leaderboard</h1>
        <p className="doc-subtitle anim-fade-in-up anim-stagger-3 max-w-3xl">
          Public GitHub activity for{" "}
          <Link
            href="https://github.com/Tracer-Cloud/opensre"
            className="doc-link break-words"
          >
            Tracer-Cloud/opensre
          </Link>{" "}
          ranked by total activity during{" "}
          {windowLabel ? (
            <span className="text-white">{windowLabel}</span>
          ) : (
            presetOption.label.toLowerCase()
          )}
          .
        </p>
        {source ? (
          <p className="doc-meta anim-fade-in-up anim-stagger-4 break-words">
            Data source:{" "}
            {source === "github" ? "Live GitHub API" : "Cached Vercel Blob snapshot"}
            {" · "}
            Window: {presetOption.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
