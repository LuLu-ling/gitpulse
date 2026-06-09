import type {
  NotificationLabel,
  NotificationSubjectKind,
  NotificationSubjectState,
} from '#shared/types/notifications';

import parseGitHubRepoPath from './parseGitHubRepoPath';

interface DashboardIssuePrLabel {
  id?: number | string;
  name: string;
  color: string;
}

interface DashboardIssuePrUser {
  login?: string | null;
  avatar_url?: string | null;
}

export interface DashboardIssuePrEntity {
  id: PropertyKey;
  title?: string;
  repository_url?: string | null;
  number?: number | null;
  updated_at?: string;
  state?: NotificationSubjectState;
  merged_at?: string | null;
  pull_request?: unknown;
  user?: DashboardIssuePrUser | null;
  labels?: DashboardIssuePrLabel[];
}

export interface DashboardIssuePrCard {
  id: PropertyKey;
  title: string;
  number: number | null;
  repositoryName: string;
  updatedAt: string | undefined;
  subjectType: NotificationSubjectKind;
  state: NotificationSubjectState;
  actorLogin: string;
  actorAvatarUrl: string;
  labels: NotificationLabel[];
}

const getRepositoryName = (repositoryUrl: string | null | undefined) => {
  if (!repositoryUrl) return '';

  return parseGitHubRepoPath(repositoryUrl)?.fullName ?? '';
};

export default function toDashboardIssuePrCard(
  entity: DashboardIssuePrEntity
): DashboardIssuePrCard {
  const isPullRequest = typeof entity.pull_request === 'object' && entity.pull_request !== null;

  return {
    id: entity.id,
    title: entity.title ?? '',
    number: entity.number ?? null,
    repositoryName: getRepositoryName(entity.repository_url),
    updatedAt: entity.updated_at,
    subjectType: isPullRequest ? 'PullRequest' : 'Issue',
    state: entity.merged_at ? 'merged' : (entity.state ?? 'closed'),
    actorLogin: entity.user?.login ?? '',
    actorAvatarUrl: entity.user?.avatar_url ?? '',
    labels: (entity.labels ?? []).map((label) => ({
      name: label.name,
      color: label.color,
    })),
  };
}
