import { describe, expect, test } from 'bun:test';

import { resolveMarkdownColorModeSourceMedia } from '../shared/utils/markdown-color-mode-source-media';

describe('resolveMarkdownColorModeSourceMedia', () => {
  test('matches dark sources when app color mode is dark', () => {
    expect(resolveMarkdownColorModeSourceMedia('(prefers-color-scheme: dark)', 'dark')).toBe('all');
    expect(resolveMarkdownColorModeSourceMedia('(prefers-color-scheme: light)', 'dark')).toBe(
      'not all'
    );
  });

  test('matches light and no-preference sources when app color mode is light', () => {
    expect(resolveMarkdownColorModeSourceMedia('(prefers-color-scheme: light)', 'light')).toBe(
      'all'
    );
    expect(
      resolveMarkdownColorModeSourceMedia(
        '(prefers-color-scheme: light), (prefers-color-scheme: no-preference)',
        'light'
      )
    ).toBe('all');
  });

  test('leaves compound media queries unchanged', () => {
    expect(
      resolveMarkdownColorModeSourceMedia(
        'screen and (max-width: 640px) and (prefers-color-scheme: dark)',
        'dark'
      )
    ).toBe('screen and (max-width: 640px) and (prefers-color-scheme: dark)');
  });

  test('leaves unrelated and negated media queries unchanged', () => {
    expect(resolveMarkdownColorModeSourceMedia('(max-width: 640px)', 'dark')).toBe(
      '(max-width: 640px)'
    );
    expect(resolveMarkdownColorModeSourceMedia('not (prefers-color-scheme: dark)', 'dark')).toBe(
      'not (prefers-color-scheme: dark)'
    );
    expect(
      resolveMarkdownColorModeSourceMedia('not screen and (prefers-color-scheme: dark)', 'light')
    ).toBe('not screen and (prefers-color-scheme: dark)');
    expect(
      resolveMarkdownColorModeSourceMedia(
        '(prefers-color-scheme: dark) or (max-width: 640px)',
        'dark'
      )
    ).toBe('(prefers-color-scheme: dark) or (max-width: 640px)');
  });
});
