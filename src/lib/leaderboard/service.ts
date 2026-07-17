import { unstable_cache } from "next/cache";
import {
  fetchContributorActivity,
  fetchGitHubUserProfile,
  resolvePriorContributorLogins,
} from "../github/client";
import { getBlobReadEnv, getGithubEnvOptional, getRefreshEnv } from "../env";
import { buildContributorDetail } from "../leaderboard/contributor-detail";
import {
  buildLeaderboardSnapshot,
  extractActiveContributorLogins,
  getCurrentWindow,
} from "../leaderboard/score";
import type {
  ContributorDetailSnapshot,
  LeaderboardSnapshot,
} from "../leaderboard/types";
import {
  DEFAULT_WINDOW_PRESET,
  type WindowPresetId,
} from "../leaderboard/window-presets";
import {
  readLeaderboardSnapshot,
  readLeaderboardSnapshotFromPath,
  writeLeaderboardSnapshot,
} from "../storage/blob";

export type LeaderboardSource = "github" | "blob" | null;

let cachedSnapshotUrl: string | null = null;

const liveSnapshotCache = new Map<
  WindowPresetId,
  () => Promise<LeaderboardSnapshot>
>();

const contributorDetailCache = new Map<
  string,
  () => Promise<ContributorDetailSnapshot | null>
>();

function contributorDetailCacheKey(
  login: string,
  windowPreset: WindowPresetId,
): string {
  return `${login.toLowerCase()}:${windowPreset}`;
}

function getContributorDetailCache(
  login: string,
  windowPreset: WindowPresetId,
): () => Promise<ContributorDetailSnapshot | null> {
  const key = contributorDetailCacheKey(login, windowPreset);
  const existing = contributorDetailCache.get(key);
  if (existing) {
    return existing;
  }

  const cached = unstable_cache(
    () => fetchContributorDetail(login, windowPreset),
    ["contributor-detail-v2", login.toLowerCase(), windowPreset],
    { revalidate: 300 },
  );

  contributorDetailCache.set(key, cached);
  return cached;
}

async function fetchContributorDetail(
  login: string,
  windowPreset: WindowPresetId = DEFAULT_WINDOW_PRESET,
): Promise<ContributorDetailSnapshot | null> {
  const env = getGithubEnvOptional();
  if (!env) {
    throw new Error(
      "GITHUB_TOKEN or GH_TOKEN is required to fetch contributor details",
    );
  }

  const now = new Date();
  const window = getCurrentWindow(now, windowPreset);

  const activity = await fetchContributorActivity({
    token: env.githubToken,
    repository: env.githubRepository,
    windowStart: window.start,
    windowEnd: window.end,
  });

  const candidateLogins = extractActiveContributorLogins(activity, window);
  const priorContributorLogins = await resolvePriorContributorLogins({
    token: env.githubToken,
    repository: env.githubRepository,
    before: window.start,
    candidateLogins,
  });

  const githubProfile = await fetchGitHubUserProfile(env.githubToken, login);

  return buildContributorDetail({
    login,
    repository: env.githubRepository,
    generatedAt: now.toISOString(),
    windowPreset,
    window,
    activity,
    priorContributorLogins,
    githubProfile,
  });
}

function getLiveSnapshotCache(
  windowPreset: WindowPresetId,
): () => Promise<LeaderboardSnapshot> {
  const existing = liveSnapshotCache.get(windowPreset);
  if (existing) {
    return existing;
  }

  const cached = unstable_cache(
    () => fetchLiveLeaderboardSnapshot(windowPreset),
    ["leaderboard-live-github", windowPreset],
    { revalidate: 300 },
  );

  liveSnapshotCache.set(windowPreset, cached);
  return cached;
}

async function fetchLiveLeaderboardSnapshot(
  windowPreset: WindowPresetId = DEFAULT_WINDOW_PRESET,
): Promise<LeaderboardSnapshot> {
  const env = getGithubEnvOptional();
  if (!env) {
    throw new Error(
      "GITHUB_TOKEN or GH_TOKEN is required to fetch live GitHub data",
    );
  }

  const now = new Date();
  const window = getCurrentWindow(now, windowPreset);

  const activity = await fetchContributorActivity({
    token: env.githubToken,
    repository: env.githubRepository,
    windowStart: window.start,
    windowEnd: window.end,
  });

  const candidateLogins = extractActiveContributorLogins(activity, window);
  const priorContributorLogins = await resolvePriorContributorLogins({
    token: env.githubToken,
    repository: env.githubRepository,
    before: window.start,
    candidateLogins,
  });

  return buildLeaderboardSnapshot({
    repository: env.githubRepository,
    generatedAt: now.toISOString(),
    windowPreset,
    window,
    activity,
    priorContributorLogins,
  });
}

async function readBlobSnapshot(): Promise<{
  snapshot: LeaderboardSnapshot;
  blobUrl: string;
} | null> {
  const publicBlobUrl = process.env.LEADERBOARD_BLOB_URL?.trim();
  if (publicBlobUrl) {
    const snapshot = await readLeaderboardSnapshot(publicBlobUrl);
    if (!snapshot) {
      return null;
    }

    cachedSnapshotUrl = publicBlobUrl;
    return { snapshot, blobUrl: publicBlobUrl };
  }

  const blobEnv = getBlobReadEnv();
  if (!blobEnv) {
    return null;
  }

  const result = await readLeaderboardSnapshotFromPath({
    token: blobEnv.blobReadWriteToken,
    pathname: blobEnv.leaderboardBlobPath,
  });

  if (!result) {
    return null;
  }

  cachedSnapshotUrl = result.url;
  return { snapshot: result.snapshot, blobUrl: result.url };
}

function snapshotMatchesPreset(
  snapshot: LeaderboardSnapshot,
  windowPreset: WindowPresetId,
): boolean {
  const snapshotPreset = snapshot.windowPreset ?? DEFAULT_WINDOW_PRESET;
  return snapshotPreset === windowPreset;
}

export async function refreshLeaderboardSnapshot(): Promise<{
  snapshot: LeaderboardSnapshot;
  blobUrl: string;
}> {
  const env = getRefreshEnv();
  const snapshot = await fetchLiveLeaderboardSnapshot(DEFAULT_WINDOW_PRESET);

  const blob = await writeLeaderboardSnapshot({
    token: env.blobReadWriteToken,
    pathname: env.leaderboardBlobPath,
    snapshot,
  });

  cachedSnapshotUrl = blob.url;

  return {
    snapshot,
    blobUrl: blob.url,
  };
}

export async function loadLeaderboardSnapshot(
  windowPreset: WindowPresetId = DEFAULT_WINDOW_PRESET,
): Promise<{
  snapshot: LeaderboardSnapshot | null;
  source: LeaderboardSource;
  blobUrl: string | null;
  error: string | null;
}> {
  let blobResult: Awaited<ReturnType<typeof readBlobSnapshot>> | null = null;

  const getBlobResult = async () => {
    if (!blobResult) {
      blobResult = await readBlobSnapshot().catch(() => null);
    }
    return blobResult;
  };

  if (cachedSnapshotUrl && windowPreset === DEFAULT_WINDOW_PRESET) {
    try {
      const snapshot = await readLeaderboardSnapshot(cachedSnapshotUrl);
      if (snapshot && snapshotMatchesPreset(snapshot, windowPreset)) {
        return {
          snapshot,
          source: "blob",
          blobUrl: cachedSnapshotUrl,
          error: null,
        };
      }
    } catch {
      cachedSnapshotUrl = null;
    }
  }

  if (getGithubEnvOptional()) {
    try {
      const snapshot = await getLiveSnapshotCache(windowPreset)();
      return {
        snapshot,
        source: "github",
        blobUrl: null,
        error: null,
      };
    } catch (error) {
      if (windowPreset === DEFAULT_WINDOW_PRESET) {
        const cachedBlob = await getBlobResult();
        if (
          cachedBlob &&
          snapshotMatchesPreset(cachedBlob.snapshot, windowPreset)
        ) {
          return {
            snapshot: cachedBlob.snapshot,
            source: "blob",
            blobUrl: cachedBlob.blobUrl,
            error: null,
          };
        }
      }

      return {
        snapshot: null,
        source: null,
        blobUrl: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch live GitHub leaderboard data",
      };
    }
  }

  if (windowPreset !== DEFAULT_WINDOW_PRESET) {
    return {
      snapshot: null,
      source: null,
      blobUrl: null,
      error:
        "Configure GITHUB_TOKEN (or GH_TOKEN) to view custom time windows.",
    };
  }

  try {
    const cachedBlob = await getBlobResult();
    if (cachedBlob && snapshotMatchesPreset(cachedBlob.snapshot, windowPreset)) {
      return {
        snapshot: cachedBlob.snapshot,
        source: "blob",
        blobUrl: cachedBlob.blobUrl,
        error: null,
      };
    }

    return {
      snapshot: null,
      source: null,
      blobUrl: null,
      error:
        "Configure GITHUB_TOKEN (or GH_TOKEN) for live GitHub data, or BLOB_READ_WRITE_TOKEN for cached snapshots.",
    };
  } catch (error) {
    return {
      snapshot: null,
      source: null,
      blobUrl: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load leaderboard snapshot",
    };
  }
}

export async function loadContributorDetail(
  login: string,
  windowPreset: WindowPresetId = DEFAULT_WINDOW_PRESET,
): Promise<{
  detail: ContributorDetailSnapshot | null;
  error: string | null;
}> {
  if (!getGithubEnvOptional()) {
    return {
      detail: null,
      error:
        "Configure GITHUB_TOKEN (or GH_TOKEN) to view contributor activity details.",
    };
  }

  try {
    const detail = await getContributorDetailCache(login, windowPreset)();
    if (!detail) {
      return {
        detail: null,
        error: `No GitHub profile found for @${login}.`,
      };
    }

    return {
      detail,
      error: null,
    };
  } catch (error) {
    return {
      detail: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load contributor details",
    };
  }
}
