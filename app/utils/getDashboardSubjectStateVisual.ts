import {
  CircleDotIcon,
  CircleMinusIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestIcon,
  MessagesSquareIcon,
  TagIcon,
} from 'lucide-vue-next';
import type { Component } from 'vue';

import type { NotificationSubjectState } from '#shared/types/notifications';

interface DashboardSubjectStateVisualOptions {
  isPullRequest: boolean;
  state?: NotificationSubjectState;
  subjectType?: string;
}

export interface DashboardSubjectStateVisual {
  icon?: Component;
  color?: string;
  label: string;
}

const subjectTypeVisuals: Record<string, DashboardSubjectStateVisual> = {
  Issue: {
    icon: CircleDotIcon,
    color: '#1a7f37',
    label: 'Issue',
  },
  PullRequest: {
    icon: GitPullRequestIcon,
    color: '#8250df',
    label: 'Pull request',
  },
  Discussion: {
    icon: MessagesSquareIcon,
    color: '#0969da',
    label: 'Discussion',
  },
  Release: {
    icon: TagIcon,
    color: '#bf8700',
    label: 'Release',
  },
};

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
        color: '#1a7f37',
        label: 'Open pull request',
      };
    }

    if (state === 'merged') {
      return {
        icon: GitMergeIcon,
        color: '#0969da',
        label: 'Merged pull request',
      };
    }

    return {
      icon: GitPullRequestClosedIcon,
      color: '#000000',
      label: 'Closed pull request',
    };
  }

  if (state === 'open') {
    return {
      icon: CircleDotIcon,
      color: '#1a7f37',
      label: 'Open issue',
    };
  }

  return {
    icon: CircleMinusIcon,
    color: '#000000',
    label: 'Closed issue',
  };
}
