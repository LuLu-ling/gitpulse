<template>
  <TimelineCommentCard
    :item="item"
    :empty-text="t('detailTimeline.noCommentBody')"
    :repo-owner="repoOwner"
    :repo-name="repoName"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import TimelineCommentCard from '~/components/dashboard/timeline/TimelineCommentCard.vue';
import type { IssueTimelineItem } from '~/composables/useIssueTimelineEvents';

defineProps<{
  item: IssueTimelineItem;
  repoOwner: string;
  repoName: string;
}>();

const { t } = useI18n();
</script>
