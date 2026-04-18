export default defineEventHandler(async (event) => {
  try {
    const { owner, repo, issue_number } = event.context.params as {
      owner: string;
      repo: string;
      issue_number: string;
    };

    const body = await readBody<{ body?: string }>(event);
    const commentBody = body?.body?.trim();

    if (!commentBody) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Comment body is required',
      });
    }

    const octokit = await getGitHubClient(event);
    const { data: comment } = await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner,
        repo,
        issue_number: Number.parseInt(issue_number, 10),
        body: commentBody,
      }
    );

    return comment;
  } catch (error: any) {
    console.error('Error creating issue comment:', error);

    if (error?.statusCode) {
      throw error;
    }

    if (error?.status) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message || 'Failed to create comment',
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create comment',
    });
  }
});
