import { getGitHubSessionContext, throwGitHubRouteError } from '#server/utils/github-auth-utils';
import {
  fetchIssueReactionSummary,
  parseReactionTargetId,
} from '#server/utils/github-reaction-utils';

export default definePrivateApiCoalescedEventHandler(async (event) => {
  try {
    const { owner, repo, issue_number } = event.context.params as {
      owner?: string;
      repo?: string;
      issue_number?: string;
    };

    if (!owner || !repo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      });
    }

    const issueNumber = parseReactionTargetId(issue_number, 'Issue number');
    const { octokit, userLogin } = await getGitHubSessionContext(event);

    return await fetchIssueReactionSummary(
      octokit,
      {
        owner,
        repo,
        targetId: issueNumber,
      },
      userLogin
    );
  } catch (error: unknown) {
    console.error('Error fetching GitHub issue reactions:', error);
    throwGitHubRouteError(error, 'Failed to fetch issue reactions');
  }
});
