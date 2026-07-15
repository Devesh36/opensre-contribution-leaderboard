import { refreshLeaderboardSnapshot } from "../src/lib/leaderboard/service";

async function main() {
  const result = await refreshLeaderboardSnapshot();

  console.log(
    JSON.stringify(
      {
        ok: true,
        generatedAt: result.snapshot.generatedAt,
        contributors: result.snapshot.contributors.length,
        blobUrl: result.blobUrl,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
