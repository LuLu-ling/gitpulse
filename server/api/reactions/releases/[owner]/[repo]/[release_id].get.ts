import { getGitHubSessionContext, throwGitHubRouteError } from '#server/utils/github-auth-utils';
import {
  fetchReleaseReactionSummary,
  parseReactionTargetId,
} from '#server/utils/github-reaction-utils';

export default definePrivateApiCoalescedEventHandler(async (event) => {
  try {
    const { owner, repo, release_id } = event.context.params as {
      owner?: string;
      repo?: string;
      release_id?: string;
    };

    if (!owner || !repo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      });
    }

    const releaseId = parseReactionTargetId(release_id, 'Release ID');
    const { octokit, userLogin } = await getGitHubSessionContext(event);

    return await fetchReleaseReactionSummary(
      octokit,
      {
        owner,
        repo,
        targetId: releaseId,
      },
      userLogin
    );
  } catch (error: unknown) {
    console.error('Error fetching GitHub release reactions:', error);
    throwGitHubRouteError(error, 'Failed to fetch release reactions');
  }
});
