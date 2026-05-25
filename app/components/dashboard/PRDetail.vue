<template>
  <div
    :class="[
      'pr-detail-layout',
      { 'pr-detail-layout--review': isReviewWindowOpen, 'mr-6': !isReviewWindowOpen },
    ]"
  >
    <PRReviewWorkspace
      v-if="isReviewWindowOpen"
      :owner="repoOwner"
      :repo="repoName"
      :pull-number="currentPullRequest?.number || 0"
      :commit-id="reviewCommitId"
      :title="currentPullRequest?.title"
      @close="isReviewWindowOpen = false"
    />

    <div v-else class="columns">
      <div class="column is-three-quarters">
        <div v-if="detailError" class="notification is-danger is-light mb-4 py-2 px-3">
          <p class="is-size-7">{{ detailError }}</p>
        </div>

        <PRHeader
          :pull-request="currentPullRequest"
          :repo-owner="repoOwner"
          :repo-name="repoName"
        />

        <hr />

        <div class="pr-detail__timeline mt-4">
          <PRTimelineEvents
            :timeline="timeline"
            :loading="loadingTimeline"
            :repo-owner="repoOwner"
            :repo-name="repoName"
            :pull-number="currentPullRequest?.number || 0"
            :has-next-page="hasNextTimelinePage"
            :loading-more="loadingMoreTimeline"
            @switch-issue="switchToIssue"
            @switch-pull-request="switchToPullRequest"
            @comment-created="addTimelineEvent"
            @load-more="loadMoreTimeline"
          />
        </div>
      </div>

      <div class="column is-one-quarter ml-6">
        <div class="sticky-container">
          <PRLabels :labels="currentPullRequest?.labels || []" />

          <PRActions
            :requested-reviewers="currentPullRequest?.requested_reviewers || []"
            :html-url="currentPullRequest?.html_url"
            :created-at="currentPullRequest?.created_at"
            :updated-at="currentPullRequest?.updated_at"
            :merged-at="currentPullRequest?.merged_at"
            :assignee="currentPullRequest?.assignee"
            :commits="currentPullRequest?.commits"
            :changed-files="currentPullRequest?.changed_files"
            :additions="currentPullRequest?.additions"
            :deletions="currentPullRequest?.deletions"
          />

          <button
            class="button is-link is-fullwidth mt-4"
            type="button"
            :disabled="!canOpenReviewWindow"
            @click="isReviewWindowOpen = true"
          >
            {{ t('prReview.openReview') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed, watch } from 'vue';

import PRActions from '~/components/dashboard/pr/PRActions.vue';
// Import subcomponents
import PRHeader from '~/components/dashboard/pr/PRHeader.vue';
import PRLabels from '~/components/dashboard/pr/PRLabels.vue';
import PRReviewWorkspace from '~/components/dashboard/pr/PRReviewWorkspace.vue';
import PRTimelineEvents from '~/components/dashboard/pr/PRTimelineEvents.vue';
import type { PRTimelineItem } from '~/composables/usePRTimelineEvents';
import parseGitHubRepoPath from '~/utils/parseGitHubRepoPath';

const props = defineProps<{
  pullRequest: any;
}>();

const emit = defineEmits<{
  (e: 'switch-issue', owner: string, repo: string, issueNumber: number): void;
  (e: 'switch-pull-request', owner: string, repo: string, pullNumber: number): void;
  (e: 'update:review-active', isActive: boolean): void;
}>();

// State variables
const loadingTimeline = ref(false);
const currentPullRequest = ref(props.pullRequest);
const detailError = ref('');
const timeline = ref<PRTimelineItem[]>([]);
const timelineRequestId = ref(0);
const detailRequestId = ref(0);
const currentTimelinePage = ref(1);
const hasNextTimelinePage = ref(false);
const loadingMoreTimeline = ref(false);
const isReviewWindowOpen = shallowRef(false);
const { t } = useI18n();

// Computed properties
const repoInfo = computed(() => {
  const pullRequest = currentPullRequest.value;

  return (
    parseGitHubRepoPath(pullRequest?.repository_url) ||
    parseGitHubRepoPath(pullRequest?.base?.repo?.url) ||
    parseGitHubRepoPath(pullRequest?.head?.repo?.url) ||
    null
  );
});

const repoOwner = computed(() => repoInfo.value?.owner || '');

const repoName = computed(() => repoInfo.value?.repo || '');

const reviewCommitId = computed(() => currentPullRequest.value?.head?.sha || '');

const canOpenReviewWindow = computed(() =>
  Boolean(
    repoOwner.value && repoName.value && currentPullRequest.value?.number && reviewCommitId.value
  )
);

// Methods
const switchToIssue = (owner: string, repo: string, issueNumber: number) => {
  emit('switch-issue', owner, repo, issueNumber);
};

const switchToPullRequest = (owner: string, repo: string, pullNumber: number) => {
  emit('switch-pull-request', owner, repo, pullNumber);
};

const addTimelineEvent = (event: PRTimelineItem) => {
  timeline.value.push(event);
};

const getPullRequestIdentity = () => {
  if (!repoOwner.value || !repoName.value || !currentPullRequest.value?.number) return '';
  return `${repoOwner.value}/${repoName.value}/${currentPullRequest.value.number}`;
};

const hasHydratedPullRequestDetails = (pullRequest: Record<string, unknown> | null | undefined) => {
  if (!pullRequest) {
    return false;
  }

  return [
    'requested_reviewers',
    'commits',
    'changed_files',
    'additions',
    'deletions',
    'base',
    'head',
  ].some((key) => key in pullRequest);
};

const resetPullRequestScopedState = (pullRequest: any) => {
  currentPullRequest.value = pullRequest;
  detailError.value = '';
  timeline.value = [];
  currentTimelinePage.value = 1;
  hasNextTimelinePage.value = false;
  loadingMoreTimeline.value = false;
  isReviewWindowOpen.value = false;
};

const fetchTimeline = async () => {
  if (!repoInfo.value || !currentPullRequest.value?.number) {
    return;
  }

  const requestId = timelineRequestId.value + 1;
  const pullRequestIdentity = getPullRequestIdentity();
  timelineRequestId.value = requestId;
  loadingTimeline.value = true;
  currentTimelinePage.value = 1;
  hasNextTimelinePage.value = false;

  try {
    const { owner, repo } = repoInfo.value;
    const pullNumber = currentPullRequest.value.number;

    const data = await $fetch<{
      timeline?: PRTimelineItem[];
      pageInfo?: { hasNextPage?: boolean };
    }>(`/api/pulls/${owner}/${repo}/${pullNumber}/timeline`, {
      method: 'GET',
      query: { page: 1 },
    });

    if (requestId === timelineRequestId.value && pullRequestIdentity === getPullRequestIdentity()) {
      timeline.value = data?.timeline || [];
      hasNextTimelinePage.value = Boolean(data?.pageInfo?.hasNextPage);
    }
  } catch (err: any) {
    console.error('Error fetching PR timeline:', err);
    if (requestId === timelineRequestId.value) {
      timeline.value = [];
      hasNextTimelinePage.value = false;
    }
  } finally {
    if (requestId === timelineRequestId.value) {
      loadingTimeline.value = false;
    }
  }
};

const loadMoreTimeline = async () => {
  if (
    !repoInfo.value ||
    !currentPullRequest.value?.number ||
    !hasNextTimelinePage.value ||
    loadingMoreTimeline.value
  ) {
    return;
  }

  const requestId = timelineRequestId.value;
  const pullRequestIdentity = getPullRequestIdentity();
  const nextPage = currentTimelinePage.value + 1;
  loadingMoreTimeline.value = true;

  try {
    const { owner, repo } = repoInfo.value;
    const pullNumber = currentPullRequest.value.number;

    const data = await $fetch<{
      timeline?: PRTimelineItem[];
      pageInfo?: { hasNextPage?: boolean };
    }>(`/api/pulls/${owner}/${repo}/${pullNumber}/timeline`, {
      method: 'GET',
      query: { page: nextPage },
    });

    if (requestId === timelineRequestId.value && pullRequestIdentity === getPullRequestIdentity()) {
      timeline.value = [...timeline.value, ...(data?.timeline || [])];
      hasNextTimelinePage.value = Boolean(data?.pageInfo?.hasNextPage);
      currentTimelinePage.value = nextPage;
    }
  } catch (err: any) {
    console.error('Error loading more PR timeline:', err);
  } finally {
    if (requestId === timelineRequestId.value) {
      loadingMoreTimeline.value = false;
    }
  }
};

const fetchPullRequestDetails = async () => {
  if (!repoInfo.value || !currentPullRequest.value?.number) {
    return;
  }

  const requestId = detailRequestId.value + 1;
  const pullRequestIdentity = getPullRequestIdentity();
  const basePullRequest = currentPullRequest.value;
  detailRequestId.value = requestId;
  detailError.value = '';

  try {
    const { owner, repo } = repoInfo.value;
    const pullNumber = currentPullRequest.value.number;

    const data = await $fetch<Record<string, unknown>>(
      `/api/pulls/${owner}/${repo}/${pullNumber}`,
      {
        method: 'GET',
      }
    );

    if (requestId === detailRequestId.value && pullRequestIdentity === getPullRequestIdentity()) {
      currentPullRequest.value = { ...basePullRequest, ...data };
    }
  } catch (err: any) {
    console.error('Error fetching PR details:', err);
    if (requestId === detailRequestId.value && pullRequestIdentity === getPullRequestIdentity()) {
      currentPullRequest.value = basePullRequest;
      detailError.value =
        err?.data?.statusMessage || err?.message || 'Failed to load pull request details.';
    }
  }
};

// Watch for changes in props.pullRequest
watch(
  () => props.pullRequest,
  (newPullRequest) => {
    timelineRequestId.value += 1;
    detailRequestId.value += 1;
    resetPullRequestScopedState(newPullRequest);
    if (newPullRequest) {
      fetchTimeline();
      if (hasHydratedPullRequestDetails(newPullRequest as Record<string, unknown>)) {
        return;
      }

      fetchPullRequestDetails();
    }
  },
  { immediate: true }
);

watch(
  isReviewWindowOpen,
  (isOpen) => {
    emit('update:review-active', isOpen);
  },
  { immediate: true }
);

useHead({
  htmlAttrs: {
    'data-color-mode': 'light',
    'data-light-theme': 'light',
  },
});
</script>

<style scoped lang="scss">
.sticky-container {
  position: sticky;
  top: 2rem;
}

.pr-detail-layout {
  min-height: 100%;
}

.pr-detail-layout--review {
  position: absolute;
  inset: 0;
  min-height: 0;
  overflow: hidden;
}

.pr-detail__timeline {
  padding-bottom: 5rem;
}
</style>
