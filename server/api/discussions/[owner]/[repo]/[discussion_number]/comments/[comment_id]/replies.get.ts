import {
  fetchDiscussionCommentReplies,
  validateDiscussionNodeId,
} from '#server/utils/github-discussion-utils';
import {
  executeGitHubRequest,
  extractDiscussionRouteParams,
  getStringQueryParam,
} from '#server/utils/repo-route-utils';

export default definePrivateApiCoalescedEventHandler(async (event) => {
  const { owner, repo, discussionNumber } = extractDiscussionRouteParams(event);

  const { comment_id } = event.context.params as { comment_id?: string };
  const commentId = validateDiscussionNodeId(comment_id, 'Discussion comment ID');
  const cursor = getStringQueryParam(getQuery(event).cursor);

  return executeGitHubRequest(
    event,
    (octokit) =>
      fetchDiscussionCommentReplies(octokit, owner, repo, discussionNumber, commentId, cursor),
    'Failed to fetch discussion replies'
  );
});
