import {
  getGitHubErrorMessage,
  getGitHubErrorStatusCode,
} from '../../../../../../utils/github-auth-utils';

export default defineEventHandler(async (event) => {
  try {
    const { owner, repo, issue_number } = event.context.params as {
      owner: string;
      repo: string;
      issue_number: string;
    };

    const body = await readBody(event);
    const labels = Array.isArray(body.labels) ? body.labels : body.labels ? [body.labels] : [];

    const octokit = await getGitHubClient(event);

    const { data: updatedLabels } = await octokit.request(
      'PUT /repos/{owner}/{repo}/issues/{issue_number}/labels',
      {
        owner,
        repo,
        issue_number: parseInt(issue_number),
        labels,
      }
    );

    return updatedLabels;
  } catch (error: unknown) {
    console.error('Error updating issue labels:', error);

    const statusCode = getGitHubErrorStatusCode(error);
    if (statusCode) {
      throw createError({
        statusCode,
        statusMessage: getGitHubErrorMessage(error, 'Failed to update issue labels'),
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update issue labels',
    });
  }
});
