import type { ContributionWindow } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatLabel(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(start)} – ${formatter.format(end)} UTC`;
}

export function getCurrentWeekWindow(now: Date): ContributionWindow {
  const day = now.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysFromMonday,
      0,
      0,
      0,
      0,
    ),
  );
  const end = new Date(start.getTime() + 7 * DAY_MS - 1);

  return {
    label: `${formatLabel(start, end)} (current week)`,
    start: start.toISOString(),
    end: end.toISOString(),
    days: 7,
  };
}

export function getContributionWindow(
  now: Date,
  anchorIso: string,
  windowDays: number,
): ContributionWindow {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new Error("windowDays must be a positive number");
  }

  const anchor = new Date(anchorIso);
  if (Number.isNaN(anchor.getTime())) {
    throw new Error(`Invalid window anchor: ${anchorIso}`);
  }

  const windowMs = windowDays * DAY_MS;
  const elapsed = now.getTime() - anchor.getTime();

  if (elapsed < 0) {
    const start = anchor;
    const end = new Date(anchor.getTime() + windowMs - 1);
    return {
      label: formatLabel(start, end),
      start: start.toISOString(),
      end: end.toISOString(),
      days: windowDays,
    };
  }

  const cycleIndex = Math.floor(elapsed / windowMs);
  const start = new Date(anchor.getTime() + cycleIndex * windowMs);
  const end = new Date(start.getTime() + windowMs - 1);

  return {
    label: formatLabel(start, end),
    start: start.toISOString(),
    end: end.toISOString(),
    days: windowDays,
  };
}

export function isWithinWindow(
  timestamp: string,
  window: ContributionWindow,
): boolean {
  const value = new Date(timestamp).getTime();
  const start = new Date(window.start).getTime();
  const end = new Date(window.end).getTime();

  return value >= start && value <= end;
}

export function toActiveDayDate(timestamp: string): string {
  return toIsoDate(new Date(timestamp));
}

export function getWindowCountdown(now: Date, window: ContributionWindow): {
  ended: boolean;
  days: number;
  hours: number;
  minutes: number;
} {
  const end = new Date(window.end).getTime();
  const remainingMs = Math.max(0, end - now.getTime());

  const days = Math.floor(remainingMs / DAY_MS);
  const hours = Math.floor((remainingMs % DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  return {
    ended: remainingMs === 0,
    days,
    hours,
    minutes,
  };
}
