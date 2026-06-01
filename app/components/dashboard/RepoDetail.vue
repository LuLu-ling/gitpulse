<script setup lang="ts">
import {
  ArchiveIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  GitForkIcon,
  GithubIcon,
  InfoIcon,
  LockIcon,
} from 'lucide-vue-next';
import { computed } from 'vue';

import { formatDurationFromNow } from '#imports';

const props = defineProps<{
  repository: any;
  owner: string;
  repo: string;
}>();

const { locale } = useI18n();

const copy = computed(() => {
  if (locale.value.startsWith('zh')) {
    return {
      archived: '\u5df2\u5f52\u6863',
      branch: '\u9ed8\u8ba4\u5206\u652f',
      created: '\u521b\u5efa',
      details: '\u8be6\u60c5',
      fork: '\u6d3e\u751f',
      forks: '\u5206\u53c9',
      issues: '\u5f00\u653e\u95ee\u9898',
      language: '\u8bed\u8a00',
      noDescription: '\u8fd9\u4e2a\u4ed3\u5e93\u6682\u65e0\u63cf\u8ff0',
      openGitHub: '\u5728 GitHub \u67e5\u770b',
      owner: '\u6240\u6709\u8005',
      private: '\u79c1\u6709',
      public: '\u516c\u5f00',
      pushed: '\u6700\u8fd1\u63a8\u9001',
      repository: '\u4ed3\u5e93',
      stats: '\u7edf\u8ba1',
      stars: 'Stars',
      updated: '\u66f4\u65b0',
      visibility: '\u53ef\u89c1\u6027',
      watchers: '\u5173\u6ce8',
    };
  }

  return {
    archived: 'Archived',
    branch: 'Default branch',
    created: 'Created',
    details: 'Details',
    fork: 'Fork',
    forks: 'Forks',
    issues: 'Open issues',
    language: 'Language',
    noDescription: 'No description provided',
    openGitHub: 'View on GitHub',
    owner: 'Owner',
    private: 'Private',
    public: 'Public',
    pushed: 'Pushed',
    repository: 'Repository',
    stats: 'Stats',
    stars: 'Stars',
    updated: 'Updated',
    visibility: 'Visibility',
    watchers: 'Watchers',
  };
});

const localeCode = computed(() => locale.value);

const languageColor = computed(() => {
  return getLanguageColor(props.repository.language);
});

const visibility = computed(() =>
  props.repository.private ? copy.value.private : copy.value.public
);

const repoBadges = computed(() => {
  const badges = [
    {
      icon: LockIcon,
      label: visibility.value,
      tone: props.repository.private ? 'muted' : 'neutral',
    },
  ];

  if (props.repository.fork) {
    badges.push({ icon: GitForkIcon, label: copy.value.fork, tone: 'neutral' });
  }

  if (props.repository.archived) {
    badges.push({ icon: ArchiveIcon, label: copy.value.archived, tone: 'muted' });
  }

  return badges;
});

const stats = computed(() => [
  { label: copy.value.stars, value: props.repository.stargazers_count ?? 0 },
  { label: copy.value.forks, value: props.repository.forks_count ?? 0 },
  { label: copy.value.watchers, value: props.repository.watchers_count ?? 0 },
  { label: copy.value.issues, value: props.repository.open_issues_count ?? 0 },
]);

const details = computed(() => [
  {
    label: copy.value.created,
    value: formatDate(props.repository.created_at),
  },
  {
    label: copy.value.updated,
    value: formatDate(props.repository.updated_at),
  },
  {
    label: copy.value.pushed,
    value: formatDate(props.repository.pushed_at),
  },
  {
    label: copy.value.branch,
    value: props.repository.default_branch || '-',
  },
  {
    label: copy.value.owner,
    value: props.repository.owner?.login || '-',
  },
]);

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return formatDurationFromNow(value, localeCode.value);
};
</script>

<template>
  <div class="repo-detail-layout">
    <div class="columns">
      <div class="column is-three-quarters">
        <section class="repo-detail-header">
          <div class="repo-detail-header__title-row">
            <GithubIcon :size="28" class="repo-detail-header__icon" />
            <h1 class="title is-3 repo-detail-header__title">{{ repository.name }}</h1>
          </div>

          <div class="repo-detail-header__meta">
            <span class="tag mr-2 repo-detail-header__type">{{ copy.repository }}</span>
            <span class="subtitle mb-0 is-6 has-text-weight-medium"> {{ owner }}/{{ repo }} </span>
            <span
              v-if="repository.language"
              class="tag is-link is-light ml-3 repo-detail-header__language"
            >
              <span
                class="repo-detail-header__language-dot"
                :style="{ backgroundColor: languageColor }"
              />
              <span>{{ repository.language }}</span>
            </span>
            <span
              v-for="badge in repoBadges"
              :key="badge.label"
              class="tag ml-2 repo-detail-header__badge"
            >
              <component :is="badge.icon" :size="13" />
              <span>{{ badge.label }}</span>
            </span>
          </div>

          <hr class="mr-4" />

          <div class="repo-detail-description">
            <p class="repo-detail-description__eyebrow">{{ owner }}/{{ repo }}</p>
            <p class="repo-detail-description__body">
              {{ repository.description || copy.noDescription }}
            </p>
          </div>
        </section>
      </div>

      <div class="column is-one-quarter detail-sidebar-column">
        <div class="sidebar-scroll">
          <div class="sidebar-card mb-4">
            <div class="sidebar-card__header">
              <div class="sidebar-card__header-left">
                <InfoIcon :size="14" class="sidebar-card__icon" />
                <span class="sidebar-card__title">{{ copy.details }}</span>
              </div>
            </div>
            <div class="sidebar-card__content">
              <div class="info-list">
                <div v-for="item in details" :key="item.label" class="info-item">
                  <span class="info-item__label">{{ item.label }}</span>
                  <span class="info-item__value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-card mb-4">
            <div class="sidebar-card__header">
              <div class="sidebar-card__header-left">
                <CircleDotIcon :size="14" class="sidebar-card__icon" />
                <span class="sidebar-card__title">{{ copy.stats }}</span>
              </div>
            </div>
            <div class="sidebar-card__content">
              <div class="info-stats">
                <div v-for="stat in stats" :key="stat.label" class="info-stat">
                  <span class="info-stat__value">{{ stat.value }}</span>
                  <span class="info-stat__label">{{ stat.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card__content">
              <a
                :href="repository.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="sidebar-link"
              >
                <ExternalLinkIcon :size="14" />
                <span>{{ copy.openGitHub }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.repo-detail-layout {
  height: 100%;
  min-height: 0;
}

.repo-detail-layout :deep(.columns) {
  height: 100%;
  min-height: 0;
  align-items: stretch;
  margin-bottom: 0;
}

.repo-detail-layout :deep(.column.is-three-quarters) {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.repo-detail-layout :deep(.column.is-one-quarter) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.repo-detail-layout :deep(.detail-sidebar-column) {
  padding-right: 1rem;
}

.repo-detail-header {
  max-width: 68rem;
  padding: 0.75rem 1rem 5rem 0;
}

.repo-detail-header__title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.repo-detail-header__icon {
  flex: 0 0 auto;
  color: var(--gitpulse-success);
}

.repo-detail-header__title {
  margin-bottom: 0;
  overflow-wrap: anywhere;
  letter-spacing: 0;
}

.repo-detail-header__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.35rem;
}

.repo-detail-header__type {
  background-color: var(--gitpulse-surface-muted);
  color: var(--gitpulse-text-strong);
}

.repo-detail-header__language,
.repo-detail-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.repo-detail-header__language-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
}

.repo-detail-description {
  max-width: 54rem;
}

.repo-detail-description__eyebrow {
  margin-bottom: 0.45rem;
  color: var(--gitpulse-link);
  font-weight: 700;
}

.repo-detail-description__body {
  margin-bottom: 0;
  color: var(--bulma-text-strong);
  font-size: 1.05rem;
  line-height: 1.65;
}

.sidebar-scroll {
  height: 100%;
  overflow-y: auto;
  padding-right: 0.75rem;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: var(--gitpulse-scrollbar-thumb) transparent;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: var(--gitpulse-scrollbar-thumb);
  }
}

.sidebar-card {
  overflow: hidden;
  border: 1px solid var(--gitpulse-border);
  border-radius: 8px;
  background: var(--gitpulse-surface-muted);
}

.sidebar-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gitpulse-border);
  background: var(--gitpulse-surface);
}

.sidebar-card__header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-card__icon {
  color: $brand-primary;
}

.sidebar-card__title {
  color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  font-size: 13px;
  font-weight: 600;
}

.sidebar-card__content {
  padding: 12px 16px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.info-item__label {
  flex-shrink: 0;
  color: var(--gitpulse-text-muted);
  font-size: 12px;
}

.info-item__value {
  min-width: 0;
  overflow: hidden;
  color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  font-size: 12px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-stat {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 5.5rem;
  padding: 0.75rem;
  border: 1px solid var(--gitpulse-border);
  border-radius: 8px;
  background: var(--gitpulse-surface);
}

.info-stat__value {
  margin-bottom: 0.25rem;
  color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  font-size: 1.35rem;
  font-weight: 800;
}

.info-stat__label {
  color: var(--gitpulse-text-muted);
  font-size: 12px;
  text-align: center;
}

.sidebar-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gitpulse-border);
  border-radius: 8px;
  background: var(--gitpulse-surface);
  color: var(--gitpulse-text-muted);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.12s ease;

  &:hover,
  &:focus-visible {
    border-color: var(--gitpulse-border-strong);
    background: var(--gitpulse-surface-hover);
    color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  }
}

@media screen and (max-width: 1024px) {
  .repo-detail-layout :deep(.columns) {
    display: block;
    height: auto;
  }

  .repo-detail-layout :deep(.column.is-three-quarters),
  .repo-detail-layout :deep(.column.is-one-quarter) {
    height: auto;
    overflow: visible;
  }

  .repo-detail-header {
    padding-right: 0;
    padding-bottom: 2rem;
  }
}
</style>
