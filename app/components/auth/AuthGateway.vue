<template>
  <div class="auth-gateway">
    <div class="auth-gateway__header mb-4">
      <p class="auth-gateway__eyebrow mb-2">{{ modeLabel }}</p>
      <h2 class="title is-4 mb-2">{{ t('landing.authCardTitle') }}</h2>
      <p class="subtitle is-6 has-text-grey mb-0">{{ t('landing.authCardSubtitle') }}</p>
    </div>

    <div class="auth-gateway__content">
      <Button
        v-if="providers.oauthEnabled"
        href="/auth/github"
        class="is-fullwidth is-justify-content-center mb-0"
      >
        <GitHubIcon class="mr-3" />
        {{ t('auth.connectWithGithub') }}
      </Button>

      <div v-if="showDivider" class="auth-gateway__divider" aria-hidden="true">
        <span>{{ t('auth.or') }}</span>
      </div>

      <form v-if="showPatSection" class="auth-gateway__pat" @submit.prevent="handlePatSubmit">
        <div class="field">
          <label class="label auth-gateway__label" for="github-pat-input">{{
            t('auth.patLabel')
          }}</label>
          <div class="control has-icons-left">
            <input
              id="github-pat-input"
              v-model="token"
              class="input"
              type="password"
              autocomplete="off"
              spellcheck="false"
              :placeholder="t('auth.patPlaceholder')"
              :disabled="submitting"
            />
            <span class="icon is-left auth-gateway__input-icon">
              <KeyRoundIcon :size="18" />
            </span>
          </div>
          <p class="help has-text-grey-dark auth-gateway__help">
            {{ t('auth.patHelp') }}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
              {{ t('auth.patHelpLink') }}
            </a>
          </p>
        </div>

        <div v-if="patError" class="notification is-danger is-light auth-gateway__error">
          {{ patError }}
        </div>

        <Button type="submit" class="is-fullwidth is-justify-content-center" :disabled="submitting">
          <LoadingIcon v-if="submitting" class="mr-3" :size="18" />
          <KeyRoundIcon v-else class="mr-3" :size="18" />
          {{ submitting ? t('auth.connectingWithPat') : t('auth.continueWithPat') }}
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeyRoundIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { GitHubIcon } from 'vue3-simple-icons';

import Button from '~/components/ui/Button.vue';
import LoadingIcon from '~/components/ui/LoadingIcon.vue';
import type { AuthProviderState } from '~/shared/types/auth-provider';

const props = defineProps<{
  providers: AuthProviderState;
}>();

const { t } = useI18n();
const { fetch: fetchUserSession } = useUserSession();
const token = ref('');
const patError = ref('');
const submitting = ref(false);

watch(
  () => props.providers,
  (providers) => {
    patError.value = '';
    token.value = '';
  },
  { deep: true }
);

const modeLabel = computed(() => {
  switch (props.providers.mode) {
    case 'hybrid':
      return t('landing.authStatusHybrid');
    case 'oauth-only':
      return t('landing.authStatusOAuthOnly');
    default:
      return t('landing.authStatusPatOnly');
  }
});

const showDivider = computed(() => props.providers.oauthEnabled && props.providers.patEnabled);
const showPatSection = computed(() => props.providers.patEnabled);

const handlePatSubmit = async () => {
  const normalizedToken = token.value.trim();

  if (!normalizedToken) {
    patError.value = t('auth.tokenRequired');
    return;
  }

  submitting.value = true;
  patError.value = '';

  try {
    await $fetch('/auth/pat', {
      method: 'POST',
      body: {
        token: normalizedToken,
      },
    });

    await fetchUserSession();
    await navigateTo('/dashboard');
  } catch (error: any) {
    const statusMessage = error?.data?.statusMessage || error?.statusMessage;

    patError.value =
      statusMessage === 'Invalid GitHub personal access token'
        ? t('auth.tokenInvalid')
        : statusMessage || t('auth.patLoginFailed');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-gateway {
  height: 100%;
}

.auth-gateway__eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4f46e5;
}

.auth-gateway__divider {
  position: relative;
  margin: 1.2rem 0;
  text-align: center;
}

.auth-gateway__divider::before {
  position: absolute;
  inset: 50% 0 auto;
  border-top: 1px solid rgba(10, 10, 10, 0.08);
  content: '';
}

.auth-gateway__divider span {
  position: relative;
  display: inline-block;
  padding: 0 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
  background: #fff;
}

.auth-gateway__label {
  font-size: 0.9rem;
  margin-bottom: 0.55rem;
}

.auth-gateway__input-icon {
  color: #6b7280;
}

.auth-gateway__help {
  margin-top: 0.55rem;
  line-height: 1.55;
}

.auth-gateway__help a {
  font-weight: 600;
}

.auth-gateway__pat {
  display: grid;
  gap: 0.9rem;
}

.auth-gateway__error {
  margin: 0;
}
</style>
