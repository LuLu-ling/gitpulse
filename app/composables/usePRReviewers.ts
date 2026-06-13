import type {
  PullRequestReviewerCandidatesResponse as PRReviewerCandidatesResponse,
  PullRequestReviewerMutationPayload as PRReviewerMutationPayload,
  PullRequestReviewerMutationResponse as PRReviewerMutationResponse,
  PullRequestReviewerSummaryWarning as PRReviewerSummaryWarning,
  PullRequestReviewersSummary as PRReviewersSummary,
} from '#shared/types/pr-reviewers';

export type {
  PullRequestReviewerCandidate as PRReviewerCandidate,
  PullRequestReviewerCandidateWarning as PRReviewerCandidateWarning,
  PullRequestReviewerCandidatesResponse as PRReviewerCandidatesResponse,
  PullRequestReviewerKind as PRReviewerKind,
  PullRequestReviewerMutationPayload as PRReviewerMutationPayload,
  PullRequestReviewerMutationResponse as PRReviewerMutationResponse,
  PullRequestReviewerRequestedTeam as PRReviewerRequestedTeam,
  PullRequestReviewerRequestedUser as PRReviewerRequestedUser,
  PullRequestReviewerStatus as PRReviewerStatus,
  PullRequestReviewerSummaryItem as PRReviewerSummaryItem,
  PullRequestReviewerSummaryWarning as PRReviewerSummaryWarning,
  PullRequestReviewersSummary as PRReviewersSummary,
} from '#shared/types/pr-reviewers';

export const createEmptyPRReviewersSummary = (
  warnings: PRReviewerSummaryWarning[] = []
): PRReviewersSummary => ({
  items: [],
  requestedUsers: [],
  requestedTeams: [],
  counts: {
    requested: 0,
    approved: 0,
    changes_requested: 0,
    commented: 0,
    dismissed: 0,
    pending: 0,
    unknown: 0,
    total: 0,
    users: 0,
    teams: 0,
  },
  warnings,
});

export function usePRReviewers() {
  const apiFetch = useGitPulseApiFetch();

  const fetchReviewerSummary = (owner: string, repo: string, pullNumber: number) =>
    apiFetch<PRReviewersSummary>(`/api/pulls/${owner}/${repo}/${pullNumber}/reviewers`, {
      method: 'GET',
    });

  const fetchReviewerCandidates = (owner: string, repo: string, pullNumber: number, query = '') =>
    apiFetch<PRReviewerCandidatesResponse>(
      `/api/pulls/${owner}/${repo}/${pullNumber}/reviewers/candidates`,
      {
        method: 'GET',
        query: query ? { q: query } : undefined,
      }
    );

  const requestReviewers = (
    owner: string,
    repo: string,
    pullNumber: number,
    payload: PRReviewerMutationPayload
  ) =>
    apiFetch<PRReviewerMutationResponse>(
      `/api/repos/${owner}/${repo}/pulls/${pullNumber}/reviewers`,
      {
        method: 'POST',
        body: payload,
      }
    );

  const removeReviewers = (
    owner: string,
    repo: string,
    pullNumber: number,
    payload: PRReviewerMutationPayload
  ) =>
    apiFetch<PRReviewerMutationResponse>(
      `/api/repos/${owner}/${repo}/pulls/${pullNumber}/reviewers`,
      {
        method: 'DELETE',
        body: payload,
      }
    );

  return {
    fetchReviewerSummary,
    fetchReviewerCandidates,
    requestReviewers,
    removeReviewers,
  };
}
