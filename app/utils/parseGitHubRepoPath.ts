export interface GitHubRepoPath {
  owner: string;
  repo: string;
  fullName: string;
}

const GITHUB_WEB_HOSTS = new Set(['github.com', 'www.github.com']);
const GITHUB_API_HOST = 'api.github.com';
const WEB_REPO_PATH_PATTERN = /^\/([^/]+)\/([^/]+)$/;
const API_REPO_PATH_PATTERN = /^\/repos\/([^/]+)\/([^/]+)$/;
const RELATIVE_WEB_REPO_PATH_PATTERN = /^\/?([^/]+)\/([^/]+)$/;
const RELATIVE_API_REPO_PATH_PATTERN = /^\/?repos\/([^/]+)\/([^/]+)$/;
const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

export default function (url?: string | null): GitHubRepoPath | null {
  if (!url) return null;

  const match = getRepoPathMatch(url);
  if (!match) return null;

  const [, owner, repo] = match;

  if (!owner || !repo) {
    return null;
  }

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
  };
}

function getRepoPathMatch(value: string): RegExpMatchArray | null {
  if (!ABSOLUTE_URL_PATTERN.test(value)) {
    return (
      value.match(RELATIVE_API_REPO_PATH_PATTERN) ?? value.match(RELATIVE_WEB_REPO_PATH_PATTERN)
    );
  }

  try {
    const parsedUrl = new URL(value);
    const host = parsedUrl.hostname.toLowerCase();

    if (host === GITHUB_API_HOST) {
      return parsedUrl.pathname.match(API_REPO_PATH_PATTERN);
    }

    if (GITHUB_WEB_HOSTS.has(host)) {
      return parsedUrl.pathname.match(WEB_REPO_PATH_PATTERN);
    }
  } catch {
    return null;
  }

  return null;
}
