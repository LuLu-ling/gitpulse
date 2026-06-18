import {
  CheckSquareIcon,
  CircleDotIcon,
  CircleMinusIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestIcon,
  MailIcon,
  MessagesSquareIcon,
  ShieldAlertIcon,
  TagIcon,
  WorkflowIcon,
} from '@lucide/vue';
import type { Component } from 'vue';

import type { NotificationSubjectState } from '#shared/types/notifications';

interface DashboardSubjectStateVisualOptions {
  isPullRequest: boolean;
  state?: NotificationSubjectState;
  subjectType?: string;
}

export interface DashboardSubjectStateVisual {
  icon?: Component;
  label: string;
  state?:
    | 'open'
    | 'closed'
    | 'merged'
    | 'discussion'
    | 'release'
    | 'commit'
    | 'check-suite'
    | 'security-alert'
    | 'workflow-run'
    | 'invitation';
}

export interface DashboardNotificationSubjectTypeOption {
  value: string;
  labelKey: string;
}

const subjectTypeVisuals: Record<string, DashboardSubjectStateVisual> = {
  Issue: {
    icon: CircleDotIcon,
    label: 'Issue',
    state: 'open',
  },
  PullRequest: {
    icon: GitPullRequestIcon,
    label: 'Pull request',
    state: 'open',
  },
  Discussion: {
    icon: MessagesSquareIcon,
    label: 'Discussion',
    state: 'discussion',
  },
  Release: {
    icon: TagIcon,
    label: 'Release',
    state: 'release',
  },
  Commit: {
    icon: GitCommitIcon,
    label: 'Commit',
    state: 'commit',
  },
  CheckSuite: {
    icon: CheckSquareIcon,
    label: 'Check suite',
    state: 'check-suite',
  },
  RepositoryVulnerabilityAlert: {
    icon: ShieldAlertIcon,
    label: 'Security alert',
    state: 'security-alert',
  },
  WorkflowRun: {
    icon: WorkflowIcon,
    label: 'Workflow run',
    state: 'workflow-run',
  },
  RepositoryInvitation: {
    icon: MailIcon,
    label: 'Repository invitation',
    state: 'invitation',
  },
};

export const DASHBOARD_NOTIFICATION_SUBJECT_TYPES: DashboardNotificationSubjectTypeOption[] = [
  { value: 'Issue', labelKey: 'dashboard.filters.subjectTypes.issue' },
  { value: 'PullRequest', labelKey: 'dashboard.filters.subjectTypes.pullRequest' },
  { value: 'Discussion', labelKey: 'dashboard.filters.subjectTypes.discussion' },
  { value: 'Release', labelKey: 'dashboard.filters.subjectTypes.release' },
  { value: 'Commit', labelKey: 'dashboard.filters.subjectTypes.commit' },
  { value: 'CheckSuite', labelKey: 'dashboard.filters.subjectTypes.checkSuite' },
  {
    value: 'RepositoryVulnerabilityAlert',
    labelKey: 'dashboard.filters.subjectTypes.repositoryVulnerabilityAlert',
  },
  { value: 'WorkflowRun', labelKey: 'dashboard.filters.subjectTypes.workflowRun' },
  {
    value: 'RepositoryInvitation',
    labelKey: 'dashboard.filters.subjectTypes.repositoryInvitation',
  },
];

export const getDashboardSubjectTypeVisual = (
  subjectType?: string
): DashboardSubjectStateVisual => {
  return subjectType
    ? (subjectTypeVisuals[subjectType] ?? { label: subjectType })
    : { label: 'Subject' };
};

export default function getDashboardSubjectStateVisual({
  isPullRequest,
  state,
  subjectType,
}: DashboardSubjectStateVisualOptions): DashboardSubjectStateVisual {
  if (!state) {
    return getDashboardSubjectTypeVisual(subjectType);
  }

  if (isPullRequest) {
    if (state === 'open') {
      return {
        icon: GitPullRequestIcon,
        label: 'Open pull request',
        state: 'open',
      };
    }

    if (state === 'merged') {
      return {
        icon: GitMergeIcon,
        label: 'Merged pull request',
        state: 'merged',
      };
    }

    return {
      icon: GitPullRequestClosedIcon,
      label: 'Closed pull request',
      state: 'closed',
    };
  }

  if (state === 'open') {
    return {
      icon: CircleDotIcon,
      label: 'Open issue',
      state: 'open',
    };
  }

  return {
    icon: CircleMinusIcon,
    label: 'Closed issue',
    state: 'closed',
  };
}
