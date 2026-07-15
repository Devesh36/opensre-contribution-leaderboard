export const RANKING_NOTES = [
  "Ranked by total activity: merged PRs + substantive reviews + linked issues closed",
  "Reviews on open PRs (not yet merged) are also counted if submitted within the window",
  "APPROVED/CHANGES_REQUESTED reviews always count; COMMENTED reviews require 20+ characters",
  "Tie-breakers: merged PRs, then reviews, then active days",
  "New contributors had no merged PRs or substantive reviews in this repo before the selected window",
  "Bots such as Dependabot, GitHub Actions, and Copilot are excluded",
] as const;

export const BOT_LOGINS = new Set([
  "dependabot",
  "dependabot[bot]",
  "github-actions",
  "github-actions[bot]",
  "renovate",
  "renovate[bot]",
  "copilot",
  "copilot-pull-request-reviewer",
  "copilot-pull-request-reviewer[bot]",
  "github-copilot[bot]",
  "greptile-apps[bot]",
  "greptile-apps",
  "codecov[bot]",
  "codecov",
  "allcontributors[bot]",
  "contrib-readme-action[bot]",
]);

export function isBotLogin(login: string | null | undefined): boolean {
  if (!login) {
    return true;
  }

  const normalized = login.toLowerCase();
  return (
    BOT_LOGINS.has(normalized) ||
    normalized.endsWith("[bot]") ||
    normalized.includes("dependabot")
  );
}
