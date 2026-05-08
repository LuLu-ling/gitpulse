<template>
  <div class="card dashboard-list-card dashboard-list-card--repo dashboard-list-card--compact">
    <div class="card-content p-3 pl-4">
      <div class="dashboard-list-card__content">
        <div class="is-flex is-align-items-flex-start mb-2">
          <div class="dashboard-list-card__text-stack">
            <p class="title is-6 mb-1 dashboard-list-card__title">{{ repo.name }}</p>
            <p
              v-if="repo.description"
              class="subtitle is-7 has-text-grey mb-0 dashboard-list-card__description"
            >
              {{ repo.description }}
            </p>
          </div>
          <div v-if="hasBadges" class="dashboard-list-card__side-actions ml-3">
            <div class="is-flex is-align-items-center">
              <span v-if="repo.language" class="tag is-info is-light">
                {{ repo.language }}
              </span>
              <span v-if="repo.private" class="tag is-dark">Private</span>
            </div>
          </div>
        </div>

        <div class="is-flex is-align-items-center dashboard-list-card__meta">
          <div class="is-flex is-align-items-center mr-4">
            <StarIcon :size="14" class="mr-1 has-text-grey" />
            <span class="is-size-7 has-text-grey">{{ repo.stargazers_count }}</span>
          </div>
          <div class="is-flex is-align-items-center mr-4">
            <GitForkIcon :size="14" class="mr-1 has-text-grey" />
            <span class="is-size-7 has-text-grey">{{ repo.forks_count }}</span>
          </div>
          <div class="is-flex is-align-items-center">
            <EyeIcon :size="14" class="mr-1 has-text-grey" />
            <span class="is-size-7 has-text-grey">{{ repo.watchers_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StarIcon, GitForkIcon, EyeIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
  repo: any;
}>();

const hasBadges = computed(() => {
  return Boolean(props.repo.language || props.repo.private);
});
</script>

<style scoped lang="scss" src="~/assets/scss/card.scss" />
