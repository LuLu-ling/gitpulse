<script setup lang="ts">
import {
  CheckIcon,
  ChevronDownIcon,
  GitBranchIcon,
  Loader2Icon,
  SearchIcon,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import type { RepoBranch } from '~/composables/useRepoFiles';

const props = defineProps<{
  branches: RepoBranch[];
  currentBranch: string;
  defaultBranch: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  select: [branch: string];
}>();

const { t } = useI18n();

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const sortedBranches = computed(() => {
  const defaultB = props.branches.find((b) => b.name === props.defaultBranch);
  const others = props.branches
    .filter((b) => b.name !== props.defaultBranch)
    .sort((a, b) => a.name.localeCompare(b.name));

  return defaultB ? [defaultB, ...others] : others;
});

const filteredBranches = computed(() => {
  if (!searchQuery.value) return sortedBranches.value;

  const query = searchQuery.value.toLowerCase();
  return sortedBranches.value.filter((b) => b.name.toLowerCase().includes(query));
});

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
  }
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = '';
};

const selectBranch = (branch: string) => {
  if (branch === props.currentBranch) {
    close();
    return;
  }

  emit('select', branch);
  close();
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target;
  if (!(target instanceof Element) || !target.closest('.branch-selector')) {
    close();
  }
};

watch(isOpen, (open) => {
  if (open) {
    requestAnimationFrame(() => {
      searchInputRef.value?.focus();
    });
  }
});

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="branch-selector">
    <button
      type="button"
      class="branch-selector__trigger"
      :disabled="loading"
      :aria-expanded="isOpen"
      :aria-label="t('branchSelector.label')"
      @click.stop="toggle"
    >
      <Loader2Icon v-if="loading" :size="14" class="branch-selector__spinner" />
      <GitBranchIcon v-else :size="14" aria-hidden="true" />
      <span class="branch-selector__branch-name">{{ currentBranch || '—' }}</span>
      <ChevronDownIcon
        :size="14"
        :class="['branch-selector__chevron', { 'branch-selector__chevron--open': isOpen }]"
        aria-hidden="true"
      />
    </button>

    <div v-if="isOpen" class="branch-selector__dropdown" role="listbox">
      <div class="branch-selector__search">
        <SearchIcon :size="14" class="branch-selector__search-icon" aria-hidden="true" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="branch-selector__search-input"
          :placeholder="t('branchSelector.searchPlaceholder')"
        />
      </div>

      <div v-if="filteredBranches.length === 0" class="branch-selector__empty">
        {{ t('branchSelector.noBranches') }}
      </div>

      <div v-else class="branch-selector__list">
        <button
          v-for="branch in filteredBranches"
          :key="branch.name"
          type="button"
          :class="[
            'branch-selector__item',
            { 'branch-selector__item--active': branch.name === currentBranch },
          ]"
          role="option"
          :aria-selected="branch.name === currentBranch"
          @click="selectBranch(branch.name)"
        >
          <GitBranchIcon :size="14" class="branch-selector__item-icon" aria-hidden="true" />
          <span class="branch-selector__item-name">{{ branch.name }}</span>
          <span v-if="branch.name === defaultBranch" class="branch-selector__item-badge">
            {{ t('branchSelector.default') }}
          </span>
          <CheckIcon
            v-if="branch.name === currentBranch"
            :size="14"
            class="branch-selector__item-check"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.branch-selector {
  position: relative;
  flex: none;
}

.branch-selector__trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--gitpulse-border);
  border-radius: 6px;
  background: var(--gitpulse-surface);
  color: var(--gitpulse-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
  max-width: 12rem;

  &:hover:not(:disabled) {
    background: var(--gitpulse-surface-hover);
    border-color: var(--gitpulse-border-strong);
    color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.branch-selector__branch-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-selector__chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.branch-selector__chevron--open {
  transform: rotate(180deg);
}

.branch-selector__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.branch-selector__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 14rem;
  max-height: 20rem;
  margin-top: 4px;
  border: 1px solid var(--gitpulse-border);
  border-radius: 8px;
  background: var(--gitpulse-surface);
  box-shadow: var(--gitpulse-shadow-raised);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.branch-selector__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--gitpulse-border);
}

.branch-selector__search-icon {
  flex-shrink: 0;
  color: var(--gitpulse-text-muted);
}

.branch-selector__search-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--bulma-text-strong, var(--gitpulse-text-strong));
  font-size: 12px;
  outline: none;

  &::placeholder {
    color: var(--gitpulse-text-muted);
  }
}

.branch-selector__empty {
  padding: 12px;
  color: var(--gitpulse-text-muted);
  font-size: 12px;
  text-align: center;
}

.branch-selector__list {
  overflow-y: auto;
  max-height: 16rem;
}

.branch-selector__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  background: transparent;
  color: var(--gitpulse-text-muted);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: var(--gitpulse-surface-hover);
  }

  &--active {
    background: var(--gitpulse-surface-active);
    color: var(--gitpulse-accent);

    &:hover {
      background: var(--gitpulse-surface-active);
    }
  }
}

.branch-selector__item-icon {
  flex-shrink: 0;
  color: var(--gitpulse-text-muted);
}

.branch-selector__item--active .branch-selector__item-icon {
  color: var(--gitpulse-accent);
}

.branch-selector__item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Consolas,
    Liberation Mono,
    Menlo,
    monospace;
  font-weight: 500;
}

.branch-selector__item-badge {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--gitpulse-surface-muted);
  color: var(--gitpulse-text-muted);
  font-size: 10px;
  font-weight: 600;
}

.branch-selector__item-check {
  flex-shrink: 0;
  color: var(--gitpulse-accent);
}
</style>
