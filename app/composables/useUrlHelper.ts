import parseGitHubMarkdownTarget, {
  type GitHubMarkdownTarget,
} from '~/utils/parseGitHubMarkdownTarget';

interface NotificationSubject {
  type?: string;
  url?: string;
}

interface NotificationLike {
  subject?: NotificationSubject;
  html_url?: string;
}

interface NotificationDetails {
  owner: string;
  repo: string;
  type: 'issues' | 'pulls';
  number: number;
  isIssue: boolean;
  isPR: boolean;
}

function isIssueOrPullSubject(notification: NotificationLike) {
  return notification.subject?.type === 'Issue' || notification.subject?.type === 'PullRequest';
}

function isSubjectTypeForTarget(
  subjectType: string | undefined,
  targetType: GitHubMarkdownTarget['type']
) {
  return (
    (subjectType === 'Issue' && targetType === 'issue') ||
    (subjectType === 'PullRequest' && targetType === 'pull-request')
  );
}

function getNotificationDetailType(targetType: GitHubMarkdownTarget['type']) {
  return targetType === 'issue' ? 'issues' : 'pulls';
}

export function useUrlHelper() {
  const getNotificationDetails = (notification: NotificationLike): NotificationDetails | null => {
    if (isIssueOrPullSubject(notification)) {
      const target = parseGitHubMarkdownTarget(notification.subject?.url);
      if (!target || !isSubjectTypeForTarget(notification.subject?.type, target.type)) return null;

      const type = getNotificationDetailType(target.type);

      return {
        owner: target.owner,
        repo: target.repo,
        type,
        number: target.number,
        isIssue: type === 'issues',
        isPR: type === 'pulls',
      };
    }

    return null;
  };

  const openExternalNotification = (notification: NotificationLike) => {
    if (isIssueOrPullSubject(notification)) {
      const details = getNotificationDetails(notification);
      if (!details) return;

      window.open(
        `https://github.com/${details.owner}/${details.repo}/${details.type}/${details.number}`,
        '_blank',
        'noopener'
      );
      return;
    }

    if (notification.html_url) {
      window.open(notification.html_url, '_blank', 'noopener');
    }
  };

  return {
    getNotificationDetails,
    openExternalNotification,
  };
}
