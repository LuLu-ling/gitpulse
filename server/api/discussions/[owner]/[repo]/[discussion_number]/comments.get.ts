import { fetchDiscussionComments } from '#server/utils/github-discussion-utils';
import {
  executeGitHubRequest,
  extractDiscussionRouteParams,
  getStringQueryParam,
} from '#server/utils/repo-route-utils';

export default definePrivateApiCoalescedEventHandler(async (event) => {
  const { owner, repo, discussionNumber } = extractDiscussionRouteParams(event);
  const cursor = getStringQueryParam(getQuery(event).cursor);

  return executeGitHubRequest(
    event,
    (octokit) => fetchDiscussionComments(octokit, owner, repo, discussionNumber, cursor),
    'Failed to fetch discussion comments'
  );
});
