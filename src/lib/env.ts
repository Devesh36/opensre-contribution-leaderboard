type GithubEnv = {
  githubToken: string;
  githubRepository: string;
};

type ServerEnv = GithubEnv & {
  blobReadWriteToken: string;
  cronSecret: string;
  leaderboardBlobPath: string;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

export function resolveGithubToken(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || null;
}

function getSharedConfig() {
  return {
    githubRepository:
      process.env.GITHUB_REPOSITORY?.trim() || "Tracer-Cloud/opensre",
    leaderboardBlobPath:
      process.env.LEADERBOARD_BLOB_PATH?.trim() || "leaderboard/snapshot.json",
  };
}

export function getGithubEnvOptional(): GithubEnv | null {
  const githubToken = resolveGithubToken();
  if (!githubToken) {
    return null;
  }

  return {
    githubToken,
    ...getSharedConfig(),
  };
}

export function getRefreshEnv(): ServerEnv {
  return {
    githubToken: requireEnv("GITHUB_TOKEN", resolveGithubToken() ?? undefined),
    blobReadWriteToken: requireEnv(
      "BLOB_READ_WRITE_TOKEN",
      process.env.BLOB_READ_WRITE_TOKEN,
    ),
    cronSecret: requireEnv("CRON_SECRET", process.env.CRON_SECRET),
    ...getSharedConfig(),
  };
}

export function getBlobReadEnv(): Pick<
  ServerEnv,
  "blobReadWriteToken" | "leaderboardBlobPath"
> | null {
  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobReadWriteToken) {
    return null;
  }

  return {
    blobReadWriteToken,
    leaderboardBlobPath: getSharedConfig().leaderboardBlobPath,
  };
}

export function getPublicEnv() {
  return {
    githubRepository: getSharedConfig().githubRepository,
  };
}
