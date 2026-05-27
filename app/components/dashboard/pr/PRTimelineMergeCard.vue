<template>
  <div class="merge-item px-4 pt-3 pb-3">
    <div class="is-flex is-align-items-center">
      <RoundImg
        v-if="item.actor?.avatarUrl"
        class="mr-3 merge-avatar"
        width="32"
        height="32"
        :src="item.actor.avatarUrl"
        :alt="item.actor.login"
      />
      <div v-else class="mr-3 has-background-grey-lighter merge-avatar-fallback merge-avatar">
        <GitMergeIcon :size="16" />
      </div>

      <div class="is-flex is-flex-direction-column is-justify-content-center is-flex-grow-1">
        <div class="is-flex is-align-items-center">
          <a
            v-if="item.actor?.login"
            :href="item.actor.url"
            target="_blank"
            class="is-size-6 has-text-weight-medium has-text-link mr-2"
          >
            {{ item.actor.login }}
          </a>
          <span class="merge-label">
            <GitMergeIcon :size="14" class="mr-1" />
            merged commit
          </span>
        </div>

        <span class="is-size-7 has-text-grey mt-1">
          {{ formatDurationFromNow(item.createdAt || '', localeCode) }}
        </span>
      </div>

      <a
        v-if="item.commit?.oid"
        :href="
          item.commit.commitUrl ||
          item.commit.url ||
          `https://github.com/${repoOwner}/${repoName}/commit/${item.commit.oid}`
        "
        target="_blank"
        class="merge-sha tag is-family-monospace ml-3"
      >
        {{ item.commit.oid.slice(0, 7) }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GitMergeIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundImg from '~/components/ui/RoundImg.vue';
import type { PRTimelineItem } from '~/composables/usePRTimelineEvents';
import formatDurationFromNow from '~/utils/formatDurationFromNow';

defineProps<{
  item: PRTimelineItem;
  repoOwner: string;
  repoName: string;
}>();

const { locale } = useI18n();
const localeCode = computed(() => locale.value);
</script>

<style scoped lang="scss">
.merge-item {
  border-radius: 12px;
  background-color: #f5f0ff;
  border-left: 3px solid #8250df;
  transition: background-color 0.2s ease;
}

.merge-avatar {
  flex-shrink: 0;
}

.merge-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8250df;
}

.merge-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8250df;
}

.merge-sha {
  font-size: 0.75rem;
  background-color: #e9dffc;
  color: #6b3ab0;
  font-weight: 500;

  &:hover {
    background-color: #d8c8f6;
    color: #5a2d9e;
  }
}

.is-family-monospace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}
</style>
