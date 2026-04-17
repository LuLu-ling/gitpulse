<template>
  <TimelineCommentCard
    :item="item"
    :empty-text="emptyText"
    :repo-owner="repoOwner"
    :repo-name="repoName"
  />
</template>

<script setup lang="ts">
import TimelineCommentCard from '~/components/dashboard/timeline/TimelineCommentCard.vue';
import type { PRTimelineItem } from '~/composables/usePRTimelineEvents';

withDefaults(
  defineProps<{
    item: PRTimelineItem;
    emptyText?: string;
    repoOwner: string;
    repoName: string;
  }>(),
  {
    emptyText: 'No comment body',
  }
);
</script>
