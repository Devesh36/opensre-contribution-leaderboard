import type { ContributionWindow } from "./types";
import { getCurrentWeekWindow } from "./window";

const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_WINDOW_PRESET = "current-week" as const;

export type WindowPresetId =
  | "current-week"
  | "last-week"
  | "last-7-days"
  | "last-14-days"
  | "last-30-days";

export type WindowPresetOption = {
  id: WindowPresetId;
  label: string;
  shortLabel: string;
  description: string;
};

export const WINDOW_PRESET_OPTIONS: WindowPresetOption[] = [
  {
    id: "current-week",
    label: "Current week",
    shortLabel: "Week",
    description: "Monday through Sunday UTC",
  },
  {
    id: "last-week",
    label: "Last week",
    shortLabel: "Last wk",
    description: "Previous Monday through Sunday UTC",
  },
  {
    id: "last-7-days",
    label: "Last 7 days",
    shortLabel: "7d",
    description: "Rolling seven-day window ending now",
  },
  {
    id: "last-14-days",
    label: "Last 14 days",
    shortLabel: "14d",
    description: "Rolling two-week window ending now",
  },
  {
    id: "last-30-days",
    label: "Last 30 days",
    shortLabel: "30d",
    description: "Rolling thirty-day window ending now",
  },
];

function formatLabel(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(start)} – ${formatter.format(end)} UTC`;
}

function getLastWeekWindow(now: Date): ContributionWindow {
  const currentWeek = getCurrentWeekWindow(now);
  const currentStart = new Date(currentWeek.start).getTime();
  const start = new Date(currentStart - 7 * DAY_MS);
  const end = new Date(currentStart - 1);

  return {
    label: `${formatLabel(start, end)} (last week)`,
    start: start.toISOString(),
    end: end.toISOString(),
    days: 7,
  };
}

function getRollingWindow(
  now: Date,
  days: number,
  suffix: string,
): ContributionWindow {
  const end = now;
  const start = new Date(end.getTime() - days * DAY_MS);

  return {
    label: `${formatLabel(start, end)} (${suffix})`,
    start: start.toISOString(),
    end: end.toISOString(),
    days,
  };
}

export function parseWindowPreset(value: string | undefined): WindowPresetId {
  if (!value) {
    return DEFAULT_WINDOW_PRESET;
  }

  const match = WINDOW_PRESET_OPTIONS.find((option) => option.id === value);
  return match?.id ?? DEFAULT_WINDOW_PRESET;
}

export function getWindowPresetOption(
  preset: WindowPresetId,
): WindowPresetOption {
  return (
    WINDOW_PRESET_OPTIONS.find((option) => option.id === preset) ??
    WINDOW_PRESET_OPTIONS[0]
  );
}

export function resolveWindowForPreset(
  now: Date,
  preset: WindowPresetId,
): ContributionWindow {
  switch (preset) {
    case "last-week":
      return getLastWeekWindow(now);
    case "last-7-days":
      return getRollingWindow(now, 7, "last 7 days");
    case "last-14-days":
      return getRollingWindow(now, 14, "last 14 days");
    case "last-30-days":
      return getRollingWindow(now, 30, "last 30 days");
    case "current-week":
    default:
      return getCurrentWeekWindow(now);
  }
}