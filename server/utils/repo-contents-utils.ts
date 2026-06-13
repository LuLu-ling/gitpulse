import type { H3Event } from 'h3';

import { executeGitHubRequest, extractRepoParams, getStringQueryParam } from './repo-route-utils';

type RepoContentType = 'file' | 'dir' | 'symlink' | 'submodule';

interface RepoContentLinks {
  self: string;
  git: string;
  html: string;
}

interface RepoContentItem {
  name: string;
  path: string;
  type: RepoContentType;
  size: number;
  sha: string;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  _links: RepoContentLinks;
}

interface RepoFileContent extends RepoContentItem {
  type: 'file';
  content: string;
  encoding: 'base64';
}

type GitHubContentItem = RepoContentItem & {
  content?: string;
  encoding?: string;
};

function mapContentItem(item: GitHubContentItem): RepoContentItem {
  return {
    name: item.name,
    path: item.path,
    type: item.type,
    size: item.size,
    sha: item.sha,
    url: item.url,
    html_url: item.html_url,
    git_url: item.git_url,
    download_url: item.download_url,
    _links: item._links,
  };
}

function mapFileContent(item: GitHubContentItem): RepoFileContent | null {
  if (item.type !== 'file' || item.encoding !== 'base64') {
    return null;
  }

  return {
    ...mapContentItem(item),
    type: 'file',
    content: item.content || '',
    encoding: 'base64',
  };
}

export function getContentPath(event: H3Event) {
  const params = event.context.params as { path?: string | string[] } | undefined;
  const path = params?.path;

  if (Array.isArray(path)) {
    return path.join('/');
  }

  return path || '';
}

export function fetchRepoContents(event: H3Event, contentPath = getContentPath(event)) {
  const { owner, repo } = extractRepoParams(event);
  const query = getQuery(event);
  const ref = getStringQueryParam(query.ref);

  return executeGitHubRequest(
    event,
    async (octokit) => {
      const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: contentPath,
        ref,
      });

      if (Array.isArray(data)) {
        return data.map((item) => mapContentItem(item as GitHubContentItem));
      }

      return mapFileContent(data as GitHubContentItem);
    },
    'Failed to fetch repository contents'
  );
}
