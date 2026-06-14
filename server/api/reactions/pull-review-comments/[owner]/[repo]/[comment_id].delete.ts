import { getGitHubSessionContext, throwGitHubRouteError } from '#server/utils/github-auth-utils';
import {
  deletePullReviewCommentReaction,
  deleteReactionByContent,
  fetchPullReviewCommentReactionSummary,
  normalizeReactionMutationBody,
  parseReactionTargetId,
} from '#server/utils/github-reaction-utils';

export default defineEventHandler(async (event) => {
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
    const body = normalizeReactionMutationBody(await readBody(event), 'pull-review-comment');
    const { octokit, userLogin } = await getGitHubSessionContext(event);
    const options = {
      owner,
      repo,
      targetId: commentId,
    };
    const fetchSummary = () => fetchPullReviewCommentReactionSummary(octokit, options, userLogin);

    await deleteReactionByContent(
      fetchSummary,
      (reactionId) => deletePullReviewCommentReaction(octokit, options, reactionId),
      body.content
    );

    return await fetchSummary();
  } catch (error: unknown) {
    console.error('Error deleting GitHub pull request review comment reaction:', error);
    throwGitHubRouteError(error, 'Failed to delete review comment reaction');
  }
});
