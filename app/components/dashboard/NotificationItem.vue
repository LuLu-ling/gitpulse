<template>
  <div
    class="card dashboard-list-card dashboard-list-card--activity dashboard-list-card--detailed notification-card"
    :class="{ 'is-unread': currentNotification.unread }"
  >
    <div class="card-content p-3">
      <div class="dashboard-list-card__main-row notification-card__main-row">
        <div class="dashboard-list-card__icon">
          <figure class="image is-32x32">
            <NuxtImg
              :src="currentNotification.repository.owner.avatar_url"
              :alt="currentNotification.repository.owner.login"
              width="32"
              height="32"
              loading="lazy"
              class="is-rounded"
            />
            <span v-if="subjectTypeIcon" class="notification-type-badge" :style="subjectTypeColor">
              <component :is="subjectTypeIcon" :size="13" />
            </span>
          </figure>
        </div>
        <div class="dashboard-list-card__content">
          <div class="is-flex is-align-items-flex-start">
            <div class="dashboard-list-card__text-stack">
              <p class="title is-6 mb-1 dashboard-list-card__subject">
                {{ currentNotification.subject.title }}
              </p>

              <p class="subtitle is-7 has-text-grey mb-0 dashboard-list-card__meta">
                {{ currentNotification.repository.full_name }} &middot;
                {{ formatDurationFromNow(currentNotification.updated_at, localeCode) }}
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
  GitPullRequestIcon,
  CheckCircle,
  UserPlus,
  PenLine,
  Activity,
  MessageSquare,
  Mail,
  Bookmark,
  Users,
  AtSign,
  Eye,
  ShieldCheck,
  ShieldAlert,
  GitCommit,
  Bell,
  Users2,
  CheckIcon,
  CircleDotIcon,
  MessagesSquareIcon,
  TagIcon,
} from 'lucide-vue-next';
import { ref, computed } from 'vue';

import { formatDurationFromNow } from '#imports';
import LoadingIcon from '~/components/ui/LoadingIcon.vue';

const props = defineProps<{
  notification: any;
}>();

const { locale } = useI18n();
const localeCode = computed(() => locale.value);
const markingAsRead = ref(false);
const localNotification = ref({ ...props.notification });

const currentNotification = computed(() => localNotification.value);

const subjectTypeIconMap: Record<string, any> = {
  Issue: CircleDotIcon,
  PullRequest: GitPullRequestIcon,
  Discussion: MessagesSquareIcon,
  Release: TagIcon,
};

const subjectTypeColorMap: Record<string, string> = {
  Issue: '#1a7f37',
  PullRequest: '#8250df',
  Discussion: '#0969da',
  Release: '#bf8700',
};

const subjectTypeIcon = computed(() => {
  return subjectTypeIconMap[localNotification.value.subject?.type];
});

const subjectTypeColor = computed(() => {
  const color = subjectTypeColorMap[localNotification.value.subject?.type];
  return color ? { color } : {};
});

const markAsRead = async () => {
  if (markingAsRead.value || !localNotification.value.unread) return;

  markingAsRead.value = true;

  const threadId = localNotification.value.id;

  try {
    const { error } = await useFetch(`/api/notifications/${threadId}`, {
      method: 'PATCH',
    });

    if (error.value) {
      console.error('Failed to mark notification as read:', error.value);
      return;
    }

    localNotification.value.unread = false;
  } finally {
    markingAsRead.value = false;
  }
};

const reasonIconMap: Record<string, any> = {
  approval_requested: CheckCircle, // Deployment approval requested
  assign: UserPlus, // You were assigned to the issue
  author: PenLine, // You created the thread
  ci_activity: Activity, // CI workflow activity completed
  comment: MessageSquare, // You commented on the thread
  invitation: Mail, // Repository invitation accepted
  manual: Bookmark, // Manually subscribed to the thread
  member_feature_requested: Users, // Organization members requested a feature
  mention: AtSign, // You were @mentioned
  review_requested: Eye, // Pull request review requested
  security_advisory_credit: ShieldCheck, // Credited for security advisory contribution
  security_alert: ShieldAlert, // Security vulnerability alert
  state_change: GitCommit, // Thread state changed (close / merge / etc.)
  subscribed: Bell, // Watching the repository
  team_mention: Users2, // Your team was mentioned
};

const reasonIcon = computed(() => {
  return reasonIconMap[localNotification.value.reason];
});
</script>

<style scoped lang="scss" src="~/assets/scss/card.scss" />
<style scoped lang="scss">
@use 'bulma/sass/utilities/initial-variables' as iv;

.card.is-unread {
  background-color: #f5f9ff;
}

.card.is-unread::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background-color: #3e8ed0;
  pointer-events: none;
  z-index: 1;
}

.notification-type-badge {
  position: absolute;
  right: -3px;
  bottom: -3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid iv.$white;
  border-radius: 999px;
  background-color: iv.$white;
  box-shadow: 0 1px 4px hsla(221deg, 14%, 4%, 0.18);
  line-height: 1;
}

.mark-read-btn {
  opacity: 0;
  visibility: hidden;
  color: #4a4a4a;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.notification-card__actions {
  display: grid;
  grid-template-columns: 24px 24px;
  gap: 0.35rem;
  flex: 0 0 auto;
}

.notification-card__reason-slot,
.notification-card__mark-read-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.notification-card__reason-icon {
  color: iv.$grey;
  flex: 0 0 auto;
}

.notification-card:hover .mark-read-btn {
  opacity: 1;
  visibility: visible;
}

.mark-read-btn:hover {
  background-color: iv.$white-ter;
  color: iv.$grey;
}

.mark-read-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.is-spinning {
  animation: spin 1.4s linear infinite;
}
</style>
