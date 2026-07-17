# OpenSRE Contributor Leaderboard

Public contributor activity dashboard for [Tracer-Cloud/opensre](https://github.com/Tracer-Cloud/opensre). The app ranks human contributors by GitHub activity for a selectable time window.

## Features

- Selectable time windows: current week, last week, last 7/14/30 days
- Contribution window countdown and repository totals
- New contributors section with first-time activity in the window
- Top-three podium and searchable full ranking
- Raw activity counts per contributor (no weighted points)
- Protected cron refresh that writes a durable JSON snapshot to Vercel Blob

## Ranking

Contributors are ranked by **total activity** in the selected window:

`merged PRs + substantive reviews + linked issues closed`

Tie-breakers: merged PRs, then reviews, then active days. Bots such as Dependabot, GitHub Actions, and Copilot accounts are excluded.

Use the time window dropdown on the dashboard, or pass a query parameter:

- `/?window=current-week` (default)
- `/?window=last-week`
- `/?window=last-7-days`
- `/?window=last-14-days`
- `/?window=last-30-days`

## Local development

> **Note:** `pnpm install` requires roughly 500MB of free disk space for Next.js dependencies.

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

Set `GITHUB_TOKEN` or `GH_TOKEN` to load live contributor data from GitHub.

3. Start the app:

```bash
pnpm dev
```

In development, the dashboard loads live GitHub data when `GITHUB_TOKEN` or `GH_TOKEN` is configured. Without a token, it falls back to a Vercel Blob snapshot if one exists.

## Refresh workflow

Run a one-off refresh locally after configuring secrets:

```bash
pnpm refresh
```

Production refresh endpoint:

```bash
curl -X POST https://your-deployment.vercel.app/api/cron/refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

Vercel Cron is configured in `vercel.json` to call `/api/cron/refresh` once per day (Hobby plan limit).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Refresh only | GitHub PAT with public repo read access |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob read/write token |
| `CRON_SECRET` | Refresh only | Protects the cron refresh route |
| `LEADERBOARD_BLOB_URL` | Optional | Public blob URL for read-only page loads |
| `GITHUB_REPOSITORY` | Optional | Defaults to `Tracer-Cloud/opensre` |
| `LEADERBOARD_BLOB_PATH` | Optional | Defaults to `leaderboard/snapshot.json` |

## Deploy to Vercel

1. Import the repository into Vercel.
2. Vercel detects `packageManager: pnpm@10.12.3` and uses pnpm automatically.
3. Create a Blob store and attach `BLOB_READ_WRITE_TOKEN`.
4. Add `GITHUB_TOKEN`, `CRON_SECRET`, and optional overrides in Project Settings.
5. Deploy and trigger the first refresh manually.
6. Optionally copy the returned blob URL into `LEADERBOARD_BLOB_URL` for read-only rendering without listing blobs.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm refresh
```

## Limitations

- GitHub GraphQL search is used for merged PR discovery within the active window.
- Review quality is approximated by review state plus minimum comment length.
- Maintainer giveaway selection remains qualitative and is not reproduced by this ranking.

## Related links

- [OpenSRE docs](https://www.opensre.com/docs)
- [Community giveaway rules](https://www.opensre.com/docs/bi-weekly-giveaway)
- [Contribution guide](https://github.com/Tracer-Cloud/opensre/blob/main/CONTRIBUTING.md)
# opensre-contribution-leaderboard
