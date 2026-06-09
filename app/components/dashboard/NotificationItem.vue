<template>
  <div
    class="card dashboard-list-card dashboard-list-card--activity dashboard-list-card--detailed notification-card"
    :class="{ 'is-unread': currentNotification.unread }"
  >
    <div class="card-content p-3">
      <div class="dashboard-list-card__main-row notification-card__main-row">
        <div class="dashboard-list-card__icon">
          <figure class="image is-32x32">
            <GitHubAvatar
              :src="currentNotification.repository.owner.avatar_url"
              :alt="currentNotification.repository.owner.login"
              width="32"
              height="32"
              loading="lazy"
            />
            <span
              v-if="subjectVisual.icon"
              class="notification-type-badge"
              :class="{
                'notification-type-badge--pending': isSubjectStatePending,
                'notification-type-badge--error': isSubjectStateError,
                [`notification-type-badge--${subjectVisual.state}`]: subjectVisual.state,
              }"
              :title="subjectStateTitle"
              :aria-label="subjectStateTitle"
            >
              <Transition name="notification-state-icon" mode="out-in">
                <component :is="subjectVisual.icon" :key="subjectVisual.label" :size="13" />
              </Transition>
            </span>
          </figure>
        </div>
        <div class="dashboard-list-card__content">
          <div class="is-flex is-align-items-flex-start">
            <div class="dashboard-list-card__text-stack">
              <p class="title is-6 mb-1 dashboard-list-card__subject">
                {{ currentNotification.subject.title }}
              </p>

              <div v-if="subjectLabels.length" class="notification-card__labels">
                <span
                  v-for="label in subjectLabels"
                  :key="label.name"
                  class="notification-card__label"
                  :style="{
                    '--label-color': `#${label.color}`,
                    borderBottomColor: `#${label.color}`,
                  }"
                >
                  {{ label.name }}
                </span>
              </div>

              <p class="subtitle is-7 has-text-grey mb-0 dashboard-list-card__meta">
                <span v-if="currentNotification.subject?.number" class="notification-card__number">
                  #{{ currentNotification.subject.number }}
                </span>
                <span class="notification-card__meta-separator"></span>
                {{ currentNotification.repository.full_name }}
                <span class="dashboard-list-card__separator">&middot;</span>
                {{
                  formatDurationFromNow(currentNotification.updated_at, localeCode, relativeTimeNow)
                }}
              </p>
            </div>
            <div class="notification-card__actions ml-3">
              <div class="notification-card__reason-slot">
                <component :is="reasonIcon" :size="22" class="notification-card__reason-icon" />
              </div>
              <div class="notification-card__mark-read-slot">
                <button
                  v-if="currentNotification.unread"
                  class="mark-read-btn"
                  @click.stop="markAsRead"
                  :disabled="markingAsRead"
                >
                  <CheckIcon v-if="!markingAsRead" :size="16" />
                  <LoadingIcon v-else :spinning="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ActivityIcon,
  AtSignIcon,
  BellIcon,
  BookmarkIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  GitCommitIcon,
  MailIcon,
  MessageSquareIcon,
  PenLineIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  Users2Icon,
  UsersIcon,
} from 'lucide-vue-next';
import { ref, computed } from 'vue';

import { formatDurationFromNow } from '#imports';
import type { DashboardNotification } from '#shared/types/notifications';
import GitHubAvatar from '~/components/ui/GitHubAvatar.vue';
import LoadingIcon from '~/components/ui/LoadingIcon.vue';
import getDashboardSubjectStateVisual from '~/utils/getDashboardSubjectStateVisual';

const props = defineProps<{
  notification: DashboardNotification;
}>();

const { locale } = useI18n();
const localeCode = computed(() => locale.value);
const relativeTimeNow = useRelativeTimeNow();
const markingAsRead = ref(false);
const isLocallyRead = ref(false);

const currentNotification = computed(() => ({
  ...props.notification,
  unread: isLocallyRead.value ? false : props.notification.unread,
}));

const isSubjectStatePending = computed(() => {
  return currentNotification.value.subject?.stateStatus === 'pending';
});

const isSubjectStateError = computed(() => {
  return currentNotification.value.subject?.stateStatus === 'error';
});

const isPullRequestSubject = computed(() => {
  return currentNotification.value.subject?.type === 'PullRequest';
});

const subjectVisual = computed(() => {
  return getDashboardSubjectStateVisual({
    isPullRequest: isPullRequestSubject.value,
    state: currentNotification.value.subject?.state,
    subjectType: currentNotification.value.subject?.type,
  });
});

const subjectLabels = computed(() => currentNotification.value.subject?.labels ?? []);

const subjectStateTitle = computed(() => {
  if (isSubjectStatePending.value) {
    return `${subjectVisual.value.label}: status loading`;
  }

  if (isSubjectStateError.value) {
    return `${subjectVisual.value.label}: status unavailable`;
  }

  return subjectVisual.value.label;
});

const markAsRead = async () => {
  if (markingAsRead.value || !currentNotification.value.unread) return;

  markingAsRead.value = true;

  const threadId = currentNotification.value.id;

  try {
    const { error } = await useFetch(`/api/notifications/${threadId}`, {
      method: 'PATCH',
    });

    if (error.value) {
      console.error('Failed to mark notification as read:', error.value);
      return;
    }

    isLocallyRead.value = true;
  } finally {
    markingAsRead.value = false;
  }
};

const reasonIconMap: Record<string, typeof BellIcon> = {
  approval_requested: CheckCircleIcon, // Deployment approval requested
  assign: UserPlusIcon, // You were assigned to the issue
  author: PenLineIcon, // You created the thread
  ci_activity: ActivityIcon, // CI workflow activity completed
  comment: MessageSquareIcon, // You commented on the thread
  invitation: MailIcon, // Repository invitation accepted
  manual: BookmarkIcon, // Manually subscribed to the thread
  member_feature_requested: UsersIcon, // Organization members requested a feature
  mention: AtSignIcon, // You were @mentioned
  review_requested: EyeIcon, // Pull request review requested
  security_advisory_credit: ShieldCheckIcon, // Credited for security advisory contribution
  security_alert: ShieldAlertIcon, // Security vulnerability alert
  state_change: GitCommitIcon, // Thread state changed (close / merge / etc.)
  subscribed: BellIcon, // Watching the repository
  team_mention: Users2Icon, // Your team was mentioned
};

const reasonIcon = computed(() => {
  return reasonIconMap[currentNotification.value.reason ?? ''];
});
</script>

<style scoped lang="scss" src="~/assets/scss/card.scss" />
<style scoped lang="scss" src="~/assets/scss/notification-card.scss" />
