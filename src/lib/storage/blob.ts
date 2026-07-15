import type { LeaderboardSnapshot } from "../leaderboard/types";

type BlobPutResponse = {
  url: string;
  pathname: string;
  contentType: string;
};

export async function writeLeaderboardSnapshot(input: {
  token: string;
  pathname: string;
  snapshot: LeaderboardSnapshot;
}): Promise<BlobPutResponse> {
  const body = JSON.stringify(input.snapshot, null, 2);

  const response = await fetch(
    `https://blob.vercel-storage.com/${encodeURIComponent(input.pathname)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json",
        "x-content-type": "application/json",
        "x-add-random-suffix": "false",
      },
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to write leaderboard snapshot (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as BlobPutResponse;
}

export async function readLeaderboardSnapshot(
  url: string,
): Promise<LeaderboardSnapshot | null> {
  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to read leaderboard snapshot (${response.status})`);
  }

  return (await response.json()) as LeaderboardSnapshot;
}

export async function readLeaderboardSnapshotFromPath(input: {
  token: string;
  pathname: string;
}): Promise<{ snapshot: LeaderboardSnapshot; url: string } | null> {
  const listResponse = await fetch(
    `https://blob.vercel-storage.com/?prefix=${encodeURIComponent(input.pathname)}`,
    {
      headers: {
        Authorization: `Bearer ${input.token}`,
      },
      cache: "no-store",
    },
  );

  if (!listResponse.ok) {
    throw new Error(
      `Failed to list leaderboard snapshots (${listResponse.status})`,
    );
  }

  const payload = (await listResponse.json()) as {
    blobs?: Array<{ url: string; pathname: string }>;
  };

  const blob = payload.blobs?.find((entry) => entry.pathname === input.pathname);

  if (!blob) {
    return null;
  }

  const snapshot = await readLeaderboardSnapshot(blob.url);

  if (!snapshot) {
    return null;
  }

  return {
    snapshot,
    url: blob.url,
  };
}
