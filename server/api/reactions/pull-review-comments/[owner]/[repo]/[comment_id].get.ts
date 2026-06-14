import { getGitHubSessionContext, throwGitHubRouteError } from '#server/utils/github-auth-utils';
import {
  fetchPullReviewCommentReactionSummary,
  parseReactionTargetId,
} from '#server/utils/github-reaction-utils';

export default definePrivateApiCoalescedEventHandler(async (event) => {
  try {
    const { owner, repo, comment_id } = event.context.params as {
      owner?: string;
      repo?: string;
      comment_id?: string;
    };

    if (!owner || !repo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      });
    }

    const commentId = parseReactionTargetId(comment_id, 'Comment ID');
    const { octokit, userLogin } = await getGitHubSessionContext(event);

    return await fetchPullReviewCommentReactionSummary(
      octokit,
      {
        owner,
        repo,
        targetId: commentId,
      },
      userLogin
    );
  } catch (error: unknown) {
    console.error('Error fetching GitHub pull request review comment reactions:', error);
    throwGitHubRouteError(error, 'Failed to fetch review comment reactions');
  }
});
