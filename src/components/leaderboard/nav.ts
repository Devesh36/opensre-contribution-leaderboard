import {
  DEFAULT_WINDOW_PRESET,
  type WindowPresetId,
} from "@/lib/leaderboard/window-presets";

export type ContributorView = "top" | "new";

export function parseContributorView(value: string | undefined): ContributorView {
  return value === "new" ? "new" : "top";
}

export function buildLeaderboardHref(input?: {
  window?: WindowPresetId;
  view?: ContributorView;
}): string {
  const params = new URLSearchParams();

  if (input?.window && input.window !== DEFAULT_WINDOW_PRESET) {
    params.set("window", input.window);
  }

  if (input?.view && input.view !== "top") {
    params.set("view", input.view);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function buildContributorHref(
  login: string,
  windowPreset?: WindowPresetId,
): string {
  const params = new URLSearchParams();

  if (windowPreset && windowPreset !== DEFAULT_WINDOW_PRESET) {
    params.set("window", windowPreset);
  }

  const query = params.toString();
  return query
    ? `/contributors/${encodeURIComponent(login)}?${query}`
    : `/contributors/${encodeURIComponent(login)}`;
}
