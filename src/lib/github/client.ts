import type {
  RawContributorActivity,
  RawMergedPullRequest,
  RawReview,
} from "../leaderboard/types";
import { mapWithConcurrency } from "./concurrency";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const PR_FETCH_CONCURRENCY = 8;

const ACTOR_PROFILE = `
  login
  avatarUrl
  ... on User {
    name
  }
`;

type GraphqlActor = {
  login: string;
  avatarUrl: string;
  name?: string | null;
};

function actorName(actor: GraphqlActor | null | undefined): string | null {
  return actor?.name ?? null;
}

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ReviewNode = {
  url: string;
  submittedAt: string | null;
  state: string;
  body: string | null;
  author: GraphqlActor | null;
};

type MergedPullRequestSearchNode = {
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  author: GraphqlActor | null;
  closingIssuesReferences: {
    nodes: Array<{ number: number }>;
  };
  reviews: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: ReviewNode[];
  };
};

type ReviewOnlySearchNode = {
  number: number;
  url: string;
  reviews: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: ReviewNode[];
  };
};

type SearchResponse<T> = {
  search: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: T[];
  };
};

export class GitHubApiError extends Error {
  rateLimitRemaining: number | null;
  rateLimitReset: number | null;

  constructor(
    message: string,
    options?: {
      rateLimitRemaining?: number | null;
      rateLimitReset?: number | null;
    },
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.rateLimitRemaining = options?.rateLimitRemaining ?? null;
    this.rateLimitReset = options?.rateLimitReset ?? null;
  }
}

function parseRepository(repository: string): [string, string] {
  const [owner, name] = repository.split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repository slug: ${repository}`);
  }

  return [owner, name];
}

function parseClosingIssueNumbers(title: string): number[] {
  const matches = title.matchAll(
    /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi,
  );

  return Array.from(matches, (match) => Number(match[1])).filter((value) =>
    Number.isFinite(value),
  );
}

function mapSearchReviews(
  pullRequestNumber: number,
  pullRequestUrl: string,
  nodes: ReviewNode[],
): RawReview[] {
  return nodes
    .filter((review) => review.submittedAt && review.author?.login)
    .map((review) => ({
      pullRequestNumber,
      pullRequestUrl,
      reviewUrl: review.url,
      submittedAt: review.submittedAt as string,
      reviewerLogin: review.author?.login ?? null,
      reviewerName: actorName(review.author),
      reviewerAvatarUrl: review.author?.avatarUrl ?? null,
      state: review.state,
      body: review.body,
    }));
}

async function fetchGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
  const rateLimitReset = response.headers.get("x-ratelimit-reset");

  if (!response.ok) {
    throw new GitHubApiError(`GitHub GraphQL request failed (${response.status})`, {
      rateLimitRemaining: rateLimitRemaining
        ? Number(rateLimitRemaining)
        : null,
      rateLimitReset: rateLimitReset ? Number(rateLimitReset) : null,
    });
  }

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (payload.errors?.length) {
    throw new GitHubApiError(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new GitHubApiError("GitHub GraphQL response did not include data");
  }

  return payload.data;
}

async function fetchAllPullRequestReviews(
  token: string,
  owner: string,
  name: string,
  number: number,
  pullRequestUrl: string,
  initialCursor: string | null,
  initialReviews: RawReview[],
): Promise<RawReview[]> {
  const reviews = [...initialReviews];
  let cursor = initialCursor;
  let hasNextPage = Boolean(cursor);

  const query = `
    query PullRequestReviews($owner: String!, $name: String!, $number: Int!, $cursor: String) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          reviews(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              url
              submittedAt
              state
              body
              author {
                ${ACTOR_PROFILE}
              }
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await fetchGraphql<{
      repository: {
        pullRequest: {
          reviews: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            nodes: ReviewNode[];
          };
        };
      };
    }>(token, query, { owner, name, number, cursor });

    const page = data.repository.pullRequest.reviews;
    reviews.push(
      ...mapSearchReviews(number, pullRequestUrl, page.nodes),
    );

    hasNextPage = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return reviews;
}

async function processMergedPullRequest(
  token: string,
  owner: string,
  name: string,
  node: MergedPullRequestSearchNode,
): Promise<{ mergedPullRequest: RawMergedPullRequest; reviews: RawReview[] }> {
  const closingIssueNumbers = Array.from(
    new Set([
      ...node.closingIssuesReferences.nodes.map((issue) => issue.number),
      ...parseClosingIssueNumbers(node.title),
    ]),
  );

  const initialReviews = mapSearchReviews(node.number, node.url, node.reviews.nodes);
  const reviews = await fetchAllPullRequestReviews(
    token,
    owner,
    name,
    node.number,
    node.url,
    node.reviews.pageInfo.hasNextPage ? node.reviews.pageInfo.endCursor : null,
    initialReviews,
  );

  return {
    mergedPullRequest: {
      number: node.number,
      title: node.title,
      url: node.url,
      mergedAt: node.mergedAt,
      authorLogin: node.author?.login ?? null,
      authorName: actorName(node.author),
      authorAvatarUrl: node.author?.avatarUrl ?? null,
      closingIssueNumbers,
    },
    reviews,
  };
}

async function processReviewOnlyPullRequest(
  token: string,
  owner: string,
  name: string,
  node: ReviewOnlySearchNode,
): Promise<RawReview[]> {
  const pullRequestUrl =
    node.url ?? `https://github.com/${owner}/${name}/pull/${node.number}`;
  const initialReviews = mapSearchReviews(
    node.number,
    pullRequestUrl,
    node.reviews.nodes,
  );

  return fetchAllPullRequestReviews(
    token,
    owner,
    name,
    node.number,
    pullRequestUrl,
    node.reviews.pageInfo.hasNextPage ? node.reviews.pageInfo.endCursor : null,
    initialReviews,
  );
}

async function paginateSearch<T>(
  token: string,
  query: string,
  searchQuery: string,
): Promise<T[]> {
  const nodes: T[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: SearchResponse<T> = await fetchGraphql<SearchResponse<T>>(
      token,
      query,
      {
        query: searchQuery,
        cursor,
      },
    );

    nodes.push(...data.search.nodes);
    hasNextPage = data.search.pageInfo.hasNextPage;
    cursor = data.search.pageInfo.endCursor;
  }

  return nodes;
}

export async function fetchContributorActivity(input: {
  token: string;
  repository: string;
  windowStart: string;
  windowEnd: string;
}): Promise<RawContributorActivity> {
  const [owner, name] = parseRepository(input.repository);

  const startDate = input.windowStart.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const rawEndDate = input.windowEnd.slice(0, 10);
  const endDate = rawEndDate > today ? today : rawEndDate;

  const mergedSearchQuery = `
    query SearchMergedPullRequests($query: String!, $cursor: String) {
      search(query: $query, type: ISSUE, first: 50, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ... on PullRequest {
            number
            title
            url
            mergedAt
            author {
              ${ACTOR_PROFILE}
            }
            closingIssuesReferences(first: 20) {
              nodes {
                number
              }
            }
            reviews(first: 100) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                url
                submittedAt
                state
                body
                author {
                  ${ACTOR_PROFILE}
                }
              }
            }
          }
        }
      }
    }
  `;

  const reviewSearchQuery = `
    query SearchReviewPullRequests($query: String!, $cursor: String) {
      search(query: $query, type: ISSUE, first: 50, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ... on PullRequest {
            number
            url
            reviews(first: 100) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                url
                submittedAt
                state
                body
                author {
                  ${ACTOR_PROFILE}
                }
              }
            }
          }
        }
      }
    }
  `;

  const mergedNodes = await paginateSearch<MergedPullRequestSearchNode>(
    input.token,
    mergedSearchQuery,
    `repo:${owner}/${name} is:pr is:merged merged:${startDate}..${endDate}`,
  );

  const mergedResults = await mapWithConcurrency(
    mergedNodes,
    PR_FETCH_CONCURRENCY,
    (node) => processMergedPullRequest(input.token, owner, name, node),
  );

  const mergedPullRequests = mergedResults.map((result) => result.mergedPullRequest);
  const reviews = mergedResults.flatMap((result) => result.reviews);
  const seenPrNumbers = new Set(mergedNodes.map((node) => node.number));

  const reviewNodes = await paginateSearch<ReviewOnlySearchNode>(
    input.token,
    reviewSearchQuery,
    `repo:${owner}/${name} is:pr -is:draft updated:${startDate}..${endDate} -merged:${startDate}..${endDate}`,
  );

  const unseenReviewNodes = reviewNodes.filter(
    (node) => !seenPrNumbers.has(node.number),
  );

  const reviewOnlyResults = await mapWithConcurrency(
    unseenReviewNodes,
    PR_FETCH_CONCURRENCY,
    (node) => processReviewOnlyPullRequest(input.token, owner, name, node),
  );

  reviews.push(...reviewOnlyResults.flat());

  return {
    mergedPullRequests,
    reviews,
  };
}

type SearchCountResponse = {
  search: {
    issueCount: number;
  };
};

function dayBeforeIsoDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

async function searchIssueCount(
  token: string,
  query: string,
): Promise<number> {
  const data = await fetchGraphql<SearchCountResponse>(
    token,
    `
      query SearchIssueCount($query: String!) {
        search(query: $query, type: ISSUE, first: 1) {
          issueCount
        }
      }
    `,
    { query },
  );

  return data.search.issueCount;
}

async function hadPriorContributorActivity(input: {
  token: string;
  repository: string;
  login: string;
  before: string;
}): Promise<boolean> {
  const [owner, name] = parseRepository(input.repository);
  const beforeDate = dayBeforeIsoDate(input.before);

  const [mergedCount, reviewCount] = await Promise.all([
    searchIssueCount(
      input.token,
      `repo:${owner}/${name} author:${input.login} is:pr is:merged merged:1970-01-01..${beforeDate}`,
    ),
    searchIssueCount(
      input.token,
      `repo:${owner}/${name} reviewed-by:${input.login} is:pr created:1970-01-01..${beforeDate}`,
    ),
  ]);

  return mergedCount > 0 || reviewCount > 0;
}

export async function resolvePriorContributorLogins(input: {
  token: string;
  repository: string;
  before: string;
  candidateLogins: string[];
}): Promise<Set<string>> {
  if (input.candidateLogins.length === 0) {
    return new Set<string>();
  }

  const priorLogins = new Set<string>();

  await mapWithConcurrency(
    input.candidateLogins,
    PR_FETCH_CONCURRENCY,
    async (login) => {
      const hadPrior = await hadPriorContributorActivity({
        token: input.token,
        repository: input.repository,
        login,
        before: input.before,
      });

      if (hadPrior) {
        priorLogins.add(login);
      }
    },
  );

  return priorLogins;
}

export type GitHubUserProfile = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
};

type RestGitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
};

export async function fetchGitHubUserProfile(
  token: string,
  login: string,
): Promise<GitHubUserProfile | null> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub user lookup failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as RestGitHubUser;

  return {
    id: data.id,
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    profileUrl: data.html_url,
  };
}
