import { existsSync, writeFileSync } from "node:fs";

const ENV_KEYS = [
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "BLOB_READ_WRITE_TOKEN",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "LEADERBOARD_BLOB_URL",
  "GITHUB_REPOSITORY",
  "LEADERBOARD_BLOB_PATH",
];

function quoteEnvValue(value) {
  if (/[\s#"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }

  return value;
}

// Next.js 16.2 on Vercel expects a bundled .env file at runtime.
// Repo keeps secrets in Vercel project settings, so generate one during build.
if (process.env.VERCEL === "1") {
  const lines = ["# Generated during Vercel build for Next.js runtime env loading"];

  for (const key of ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      lines.push(`${key}=${quoteEnvValue(value)}`);
    }
  }

  writeFileSync(".env", `${lines.join("\n")}\n`);
} else if (!existsSync(".env") && !existsSync(".env.local")) {
  writeFileSync(".env", "# Local placeholder. Copy .env.example to .env.local for development.\n");
}
