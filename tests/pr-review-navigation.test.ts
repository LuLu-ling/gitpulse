import { describe, expect, test } from 'bun:test';

import type { NavigationEntry } from '../app/composables/useNavigationHistory';
import shouldCloseReviewWorkspaceAfterSubmit from '../app/utils/prReviewNavigation';

const targetPullRequest = {
  owner: 'acme',
  repo: 'widget',
  pullNumber: 42,
} as const;

describe('PR review workspace submit navigation', () => {
  test('returns to PR details when previous history entry is the matching PR detail route', () => {
    const previousEntry: NavigationEntry = {
      type: 'pull-request',
      data: {
        owner: 'acme',
        repo: 'widget',
        number: 42,
        tab: 'pulls',
      },
    };

    expect(
      shouldCloseReviewWorkspaceAfterSubmit({
        previousEntry,
        ...targetPullRequest,
      })
    ).toBe(true);
  });

  test('does not force PR details when previous history entry is missing or not matching', () => {
    const entries: ReadonlyArray<NavigationEntry | null> = [
      null,
      { type: 'dashboard' },
      {
        type: 'pull-request',
        data: {
          owner: 'acme',
          repo: 'widget',
          number: 41,
          tab: 'pulls',
        },
      },
      {
        type: 'pull-request',
        data: {
          owner: 'acme',
          repo: 'widget',
          number: 42,
          tab: 'pulls',
          view: 'diff',
        },
      },
      {
        type: 'repository',
        data: {
          owner: 'acme',
          repo: 'widget',
        },
      },
    ];

    for (const previousEntry of entries) {
      expect(
        shouldCloseReviewWorkspaceAfterSubmit({
          previousEntry,
          ...targetPullRequest,
        })
      ).toBe(false);
    }
  });
});
