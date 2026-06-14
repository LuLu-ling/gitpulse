import { getGitHubSessionContext, throwGitHubRouteError } from '#server/utils/github-auth-utils';
import {
  deleteReactionByContent,
  deleteReleaseReaction,
  fetchReleaseReactionSummary,
  normalizeReactionMutationBody,
  parseReactionTargetId,
} from '#server/utils/github-reaction-utils';

export default defineEventHandler(async (event) => {
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
    const body = normalizeReactionMutationBody(await readBody(event), 'release');
    const { octokit, userLogin } = await getGitHubSessionContext(event);
    const options = {
      owner,
      repo,
      targetId: releaseId,
    };
    const fetchSummary = () => fetchReleaseReactionSummary(octokit, options, userLogin);

    await deleteReactionByContent(
      fetchSummary,
      (reactionId) => deleteReleaseReaction(octokit, options, reactionId),
      body.content
    );

    return await fetchSummary();
  } catch (error: unknown) {
    console.error('Error deleting GitHub release reaction:', error);
    throwGitHubRouteError(error, 'Failed to delete release reaction');
  }
});
