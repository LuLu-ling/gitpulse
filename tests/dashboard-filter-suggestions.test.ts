import { describe, expect, test } from 'bun:test';

import { ref } from 'vue';

import { useDashboardFilterSuggestions } from '../app/composables/useDashboardFilterSuggestions';

describe('dashboard filter suggestions', () => {
  test('deduplicates and sorts repo and author suggestions across visible data sources', () => {
    const suggestions = useDashboardFilterSuggestions({
      repos: ref([{ full_name: 'z/repo' }, { full_name: 'a/repo' }]),
      notifications: ref([
        {
          id: 'n1',
          repository: { full_name: 'm/repo' },
          subject: { authorLogin: 'zoe' },
        },
      ] as any[]),
      notificationTodos: ref([
        {
          notification: {
            id: 'n2',
            repository: { full_name: 'a/repo' },
            subject: { authorLogin: 'amy' },
          },
        },
      ] as any[]),
      issues: ref([
        {
          id: 1,
          repository_url: 'https://api.github.com/repos/b/repo',
          user: { login: 'ben' },
        },
      ]),
      pulls: ref([
        {
          id: 2,
          repository_url: 'https://api.github.com/repos/a/repo',
          user: { login: 'amy' },
        },
      ]),
      visibleFilters: ref({ labels: [] }),
    });

    expect(suggestions.repoFilterSuggestions.value).toEqual([
      'a/repo',
      'b/repo',
      'm/repo',
      'z/repo',
    ]);
    expect(suggestions.authorFilterSuggestions.value).toEqual(['amy', 'ben', 'zoe']);
  });

  test('limits label suggestions to the selected repo', () => {
    const suggestions = useDashboardFilterSuggestions({
      repos: ref([]),
      notifications: ref([
        {
          id: 'n1',
          repository: { full_name: 'owner/selected' },
          subject: { labels: [{ name: 'bug' }] },
        },
        {
          id: 'n2',
          repository: { full_name: 'owner/other' },
          subject: { labels: [{ name: 'wontfix' }] },
        },
      ] as any[]),
      notificationTodos: ref([
        {
          notification: {
            id: 'n3',
            repository: { full_name: 'owner/selected' },
            subject: { labels: [{ name: 'enhancement' }] },
          },
        },
      ] as any[]),
      issues: ref([
        {
          id: 1,
          repository_url: 'https://api.github.com/repos/owner/selected',
          labels: ['help wanted'],
        },
      ]),
      pulls: ref([
        {
          id: 2,
          repository_url: 'https://api.github.com/repos/owner/other',
          labels: [{ name: 'skip' }],
        },
      ]),
      visibleFilters: ref({ labels: [], repo: 'owner/selected' }),
    });

    expect(suggestions.labelFilterSuggestions.value).toEqual(['bug', 'enhancement', 'help wanted']);
  });

  test('does not suggest labels before a repo filter is selected', () => {
    const suggestions = useDashboardFilterSuggestions({
      repos: ref([]),
      notifications: ref([
        {
          id: 'n1',
          repository: { full_name: 'owner/repo' },
          subject: { labels: [{ name: 'bug' }] },
        },
      ] as any[]),
      notificationTodos: ref([]),
      issues: ref([]),
      pulls: ref([]),
      visibleFilters: ref({ labels: [] }),
    });

    expect(suggestions.labelFilterSuggestions.value).toEqual([]);
  });
});
