export default defineEventHandler(async (event) => {
  try {
    const { owner, repo } = event.context.params as {
      owner: string;
      repo: string;
    };

    if (!owner || !repo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing repository owner or name',
      });
    }

    const octokit = await getGitHubClient(event);

    const { data: repository } = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });

    return repository;
  } catch (error) {
    console.error('Error fetching repository details:', error);
    throwGitHubRouteError(error, 'Failed to fetch repository details');
  }
});
