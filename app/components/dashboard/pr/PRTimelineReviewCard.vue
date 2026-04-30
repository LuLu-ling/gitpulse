<template>
  <TimelineCommentCard
    v-if="isPlainComment"
    :item="item"
    :empty-text="t('issueDetail.noCommentBody')"
    :repo-owner="repoOwner"
    :repo-name="repoName"
  />
  <div v-else class="review-item p-4" :class="`review-item--${stateModifier}`">
    <div class="is-flex is-align-items-flex-start">
      <RoundImg
        class="mr-3 review-item__avatar"
        width="32"
        height="32"
        :src="item.author?.avatarUrl || ''"
        :alt="item.author?.login || ''"
      />
      <div class="review-item__content is-flex-grow-1">
        <div class="review-item__heading">
          <span class="review-item__badge" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path :d="iconPath" />
            </svg>
          </span>
          <a
            :href="item.author?.url"
            target="_blank"
            class="has-text-link has-text-weight-semibold review-item__author"
          >
            {{ item.author?.login }}
          </a>
          <span class="review-item__action">{{ stateAction }}</span>
          <span class="review-item__time has-text-grey">
            {{ formatDurationFromNow(item.createdAt || '', localeCode) }}
          </span>
        </div>
        <div v-if="item.body" class="review-item__body content">
          <MarkdownRenderer
            :value="item.body"
            :repo-owner="repoOwner"
            :repo-name="repoName"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TimelineCommentCard from '~/components/dashboard/timeline/TimelineCommentCard.vue';
import MarkdownRenderer from '~/components/ui/MarkdownRenderer.vue';
import RoundImg from '~/components/ui/RoundImg.vue';
import type { PRTimelineItem } from '~/composables/usePRTimelineEvents';
import formatDurationFromNow from '~/utils/formatDurationFromNow';

const props = defineProps<{
  item: PRTimelineItem;
  repoOwner: string;
  repoName: string;
}>();

const { t, locale } = useI18n();
const localeCode = computed(() => locale.value);

const isPlainComment = computed(() => {
  const state = props.item.state;
  return !state || state === 'COMMENTED';
});

const stateModifier = computed(() => {
  switch (props.item.state) {
    case 'APPROVED':
      return 'approved';
    case 'CHANGES_REQUESTED':
      return 'changes-requested';
    case 'DISMISSED':
      return 'dismissed';
    case 'PENDING':
      return 'pending';
    default:
      return 'pending';
  }
});

const stateAction = computed(() => {
  switch (props.item.state) {
    case 'APPROVED':
      return 'approved these changes';
    case 'CHANGES_REQUESTED':
      return 'requested changes';
    case 'DISMISSED':
      return 'dismissed this review';
    case 'PENDING':
      return 'started a review';
    default:
      return 'reviewed';
  }
});

const ICON_PATHS = {
  approved:
    'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z',
  'changes-requested':
    'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z',
  dismissed:
    'M3.5 8a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3.5 8Z',
  pending:
    'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm.75 4.75a.75.75 0 0 0-1.5 0v3.5c0 .2.08.39.22.53l2 2a.75.75 0 1 0 1.06-1.06L8.75 7.94V4.75Z',
} as const;

const iconPath = computed(() => ICON_PATHS[stateModifier.value as keyof typeof ICON_PATHS]);
</script>

<style scoped lang="scss">
.review-item {
  border-radius: 16px;
  background-color: #f8f9fa;
  border-left: 4px solid var(--review-accent, #d0d7de);
}

.review-item--approved {
  --review-accent: #1f883d;
  background-color: #f4fbf6;
}

.review-item--changes-requested {
  --review-accent: #cf222e;
  background-color: #fdf4f5;
}

.review-item--dismissed {
  --review-accent: #6e7781;
  background-color: #f6f7f9;
}

.review-item--pending {
  --review-accent: #9a6700;
  background-color: #fdf9ef;
}

.review-item__avatar {
  flex-shrink: 0;
}

.review-item__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.25rem;
  min-height: 32px;
}

.review-item__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  color: #fff;
  background: var(--review-accent, #d0d7de);
}

.review-item__author {
  font-size: 0.95rem;
}

.review-item__action {
  color: #57606a;
  font-size: 0.9rem;
}

.review-item__time {
  font-size: 0.8rem;
}

.review-item__body {
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.review-item__body :deep(*:last-child) {
  margin-bottom: 0;
}
</style>
