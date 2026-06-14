import { describe, expect, it } from 'bun:test';

import {
  extractCommentIdFromUrl,
  getReactionApiPathForTarget,
  getReactionContentsForTarget,
  normalizeReactionContent,
  normalizeReactionSummary,
} from '../shared/utils/reactions';

describe('reactions utilities', () => {
  it('normalizes reaction summaries with viewer state', () => {
    const summary = normalizeReactionSummary(
      [
        { id: 10, content: '+1', user: { login: 'alice' } },
        { id: 11, content: '+1', user: { login: 'bob' } },
        { id: 12, content: 'rocket', user: { login: 'ALICE' } },
        { id: 13, content: 'confused', user: { login: 'carol' } },
      ],
      'alice',
      'issue-comment'
    );

    expect(summary).toEqual([
      {
        content: '+1',
        count: 2,
        viewerHasReacted: true,
        viewerReactionId: 10,
      },
      {
        content: 'confused',
        count: 1,
        viewerHasReacted: false,
        viewerReactionId: null,
      },
      {
        content: 'rocket',
        count: 1,
        viewerHasReacted: true,
        viewerReactionId: 12,
      },
    ]);
  });

  it('limits release reactions to GitHub supported contents', () => {
    expect(getReactionContentsForTarget('release')).toEqual([
      '+1',
      'laugh',
      'heart',
      'hooray',
      'rocket',
      'eyes',
    ]);
    expect(normalizeReactionContent('-1', 'release')).toBeNull();
    expect(normalizeReactionContent('confused', 'release')).toBeNull();
    expect(normalizeReactionContent('rocket', 'release')).toBe('rocket');
  });

  it('supports the full GitHub issue reaction set for issue bodies', () => {
    expect(getReactionContentsForTarget('issue')).toEqual([
      '+1',
      '-1',
      'laugh',
      'confused',
      'heart',
      'hooray',
      'rocket',
      'eyes',
    ]);
    expect(normalizeReactionContent('-1', 'issue')).toBe('-1');
    expect(normalizeReactionContent('confused', 'issue')).toBe('confused');
  });

  it('uses explicit API paths for every reaction target', () => {
    expect(getReactionApiPathForTarget('issue')).toBe('issues');
    expect(getReactionApiPathForTarget('issue-comment')).toBe('comments');
    expect(getReactionApiPathForTarget('pull-review-comment')).toBe('pull-review-comments');
    expect(getReactionApiPathForTarget('release')).toBe('releases');
  });

  it('supports pull request review comment reaction content', () => {
    expect(getReactionContentsForTarget('pull-review-comment')).toEqual([
      '+1',
      '-1',
      'laugh',
      'confused',
      'heart',
      'hooray',
      'rocket',
      'eyes',
    ]);
    expect(normalizeReactionContent('confused', 'pull-review-comment')).toBe('confused');
  });

  it('extracts issue comment ids from GitHub urls', () => {
    expect(
      extractCommentIdFromUrl('https://github.com/owner/repo/issues/1#issuecomment-12345')
    ).toBe('12345');
    expect(
      extractCommentIdFromUrl('https://github.com/owner/repo/pull/1#pullrequestreviewcomment-67890')
    ).toBe('67890');
    expect(
      extractCommentIdFromUrl('https://api.github.com/repos/owner/repo/issues/comments/24680')
    ).toBe('24680');
    expect(extractCommentIdFromUrl('#issuecomment-42')).toBe('42');
    expect(extractCommentIdFromUrl('https://github.com/owner/repo/issues/1')).toBe('');
  });
});
