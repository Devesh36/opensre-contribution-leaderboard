import { NextResponse } from "next/server";
import { refreshLeaderboardSnapshot } from "@/lib/leaderboard/service";

function isAuthorized(request: Request, cronSecret: string): boolean {
  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${cronSecret}`) {
    return true;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshLeaderboardSnapshot();

    return NextResponse.json({
      ok: true,
      generatedAt: result.snapshot.generatedAt,
      contributors: result.snapshot.contributors.length,
      blobUrl: result.blobUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh leaderboard snapshot",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
