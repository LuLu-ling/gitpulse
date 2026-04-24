import {
  buildIssueTimelineCapabilities,
  createUnsupportedWarnings,
  fetchPaginatedArray,
  normalizeIssueTimelineEvent,
  sortTimelineItems,
  throwTimelineFatalError,
} from '../../../../../utils/github-timeline-utils';

export default defineEventHandler(async (event) => {
  try {
    const { owner, repo, issue_number } = event.context.params as {
      owner: string;
      repo: string;
      issue_number: string;
    };

    const octokit = await getGitHubClient(event);
    const issueNumber = parseInt(issue_number, 10);

    const timelineResponse = await fetchPaginatedArray<Record<string, any>>(
      octokit,
      'GET /repos/{owner}/{repo}/issues/{issue_number}/timeline',
      {
        owner,
        repo,
        issue_number: issueNumber,
      }
    );

    const timeline = sortTimelineItems(
      timelineResponse.map((rawEvent: Record<string, any>) =>
        normalizeIssueTimelineEvent(rawEvent, { owner, repo })
      )
    );

    return {
      currentParent: null,
      timeline,
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
      capabilities: buildIssueTimelineCapabilities(),
      warnings: createUnsupportedWarnings('issue'),
      errors: [],
    };
  } catch (error: any) {
    console.error('Error fetching GitHub issue timeline:', error);
    throwTimelineFatalError(error, 'Failed to fetch issue timeline');
  }
});
