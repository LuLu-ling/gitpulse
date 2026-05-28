<template>
  <aside class="menu tab-sidebar">
    <div class="sidebar-header">
      <p class="sidebar-header-title">{{ t('dashboard.sidebar.views') }}</p>
      <button
        class="button is-ghost is-small sidebar-manage-button"
        type="button"
        @click="$emit('manage-tabs')"
      >
        <span class="icon is-small mr-1">
          <SlidersHorizontalIcon :size="14" />
        </span>
        <span>{{ t('dashboard.sidebar.manageViews') }}</span>
      </button>
    </div>

    <div class="sidebar-tree" role="tree" :aria-label="t('dashboard.sidebar.views')">
      <template v-for="group in displayGroups" :key="group.id">
        <button
          class="menu-label-wrapper"
          :class="{
            'is-nested': group.depth > 0,
            'is-system': group.source === 'system',
            'is-collapsed': group.collapsed,
          }"
          :style="getDepthStyle(group.depth)"
          type="button"
          role="treeitem"
          :aria-expanded="group.source === 'system' ? undefined : !group.collapsed"
          @click="group.source !== 'system' && emit('group-toggle', group.id)"
        >
          <span class="group-heading-main">
            <span class="icon is-small group-chevron" aria-hidden="true">
              <ChevronRightIcon v-if="group.collapsed" :size="14" />
              <ChevronDownIcon v-else :size="14" />
            </span>
            <span class="icon is-small group-folder" aria-hidden="true">
              <FolderIcon v-if="group.collapsed" :size="15" />
              <FolderOpenIcon v-else :size="15" />
            </span>
            <span class="menu-label-text">{{ group.name }}</span>
          </span>
          <span v-if="getGroupTabCount(group.id) > 0" class="group-count">
            {{ getGroupTabCount(group.id) }}
          </span>
        </button>
        <div
          class="group-list-wrap"
          :class="{
            'is-collapsed': group.collapsed,
            'is-system': group.source === 'system',
            'is-nested': group.depth > 0,
          }"
          :style="getDepthStyle(group.depth)"
        >
          <ul class="menu-list" role="group">
            <li v-for="tab in getTabsForGroup(group.id)" :key="tab.id">
              <a
                :class="{ 'is-active': activeTabId === tab.id }"
                role="treeitem"
                :aria-current="activeTabId === tab.id ? 'page' : undefined"
                @click="emit('tab-select', tab.id)"
              >
                <div class="tab-item-content">
                  <span class="icon is-small mr-2">
                    <component :is="tab.icon" :size="16" />
                  </span>
                  <span class="tab-name">{{ tab.name }}</span>
                  <span
                    v-if="(tab.badgeCount ?? 0) > 0"
                    class="tag is-danger is-rounded is-small badge-count"
                  >
                    {{ tab.badgeCount }}
                  </span>
                </div>
              </a>
            </li>
          </ul>
          <p
            v-if="group.source !== 'system' && !group.collapsed && getGroupTabCount(group.id) === 0"
            class="empty-group-note"
          >
            {{ t('dashboard.sidebar.emptyGroup') }}
          </p>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  SlidersHorizontalIcon,
} from 'lucide-vue-next';
import type { Component, CSSProperties } from 'vue';
import { computed } from 'vue';

import { DEFAULT_CUSTOM_TAB_GROUP_ID } from '~/composables/useTabGroups';

const { t } = useI18n();

interface TabSidebarGroup {
  id: string;
  name: string;
  parentId?: string | null;
  collapsed?: boolean;
  source?: 'system' | 'github-search';
}

interface DisplayTabSidebarGroup extends TabSidebarGroup {
  depth: number;
}

interface TabSidebarItem {
  id: string;
  groupId: string;
  name: string;
  icon: Component;
  badgeCount?: number;
}

const props = withDefaults(
  defineProps<{
    groups?: TabSidebarGroup[];
    tabs?: TabSidebarItem[];
    activeTabId: string;
  }>(),
  {
    groups: () => [
      {
        id: DEFAULT_CUSTOM_TAB_GROUP_ID,
        name: 'General',
        collapsed: false,
        source: 'github-search',
      },
    ],
    tabs: () => [],
  }
);

const emit = defineEmits<{
  (e: 'tab-select', tabId: string): void;
  (e: 'group-toggle', groupId: string): void;
  (e: 'manage-tabs'): void;
}>();

const getTabsForGroup = (groupId: string) => props.tabs.filter((tab) => tab.groupId === groupId);
const getGroupTabCount = (groupId: string) => getTabsForGroup(groupId).length;
const getDepthStyle = (depth: number): CSSProperties & Record<'--depth-offset', string> => ({
  '--depth-offset': `${depth * 0.9}rem`,
});

const displayGroups = computed<DisplayTabSidebarGroup[]>(() => {
  const rows: DisplayTabSidebarGroup[] = [];
  const visited = new Set<string>();

  const visit = (parentId: string | null, depth: number, ancestorCollapsed = false) => {
    for (const group of props.groups) {
      const currentParentId = group.parentId ?? null;
      if (currentParentId !== parentId || visited.has(group.id)) {
        continue;
      }

      visited.add(group.id);

      // Skip system groups (Built-in Views) — they're shown in the ActivityBar
      if (group.source === 'system') {
        continue;
      }

      if (!ancestorCollapsed) {
        rows.push({ ...group, depth });
      }
      visit(group.id, depth + 1, ancestorCollapsed || Boolean(group.collapsed));
    }
  };

  visit(null, 0);

  for (const group of props.groups) {
    if (!visited.has(group.id)) {
      // Skip any system groups that might not have been visited
      if (group.source === 'system') {
        continue;
      }
      rows.push({ ...group, depth: 0 });
    }
  }

  return rows;
});
</script>

<style scoped lang="scss">
.tab-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.5rem;
  padding: 0 0.75rem 0.55rem;
}

.sidebar-header-title {
  min-width: 0;
  flex: 1;
  margin: 0;
  color: var(--bulma-text-light, #6b7280);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sidebar-manage-button {
  flex: 0 0 auto;
  height: 1.85rem;
  padding-inline: 0.45rem;
  font-weight: 650;
}

.sidebar-tree {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
  padding-inline: 0.35rem;
  overflow: hidden auto;
}

.menu-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  gap: 0.5rem;
  padding: 0.42rem 0.55rem 0.42rem calc(0.45rem + var(--depth-offset, 0rem));
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--bulma-text-light, #64748b);
  font: inherit;
  text-align: left;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--bulma-background-hover, rgba(15, 23, 42, 0.055));
    color: var(--bulma-text, #1f2937);
    box-shadow: inset 0 0 0 1px rgba(100, 116, 139, 0.08);
  }

  &:focus-visible {
    outline: 2px solid var(--bulma-primary, #485fc7);
    outline-offset: 2px;
  }

  &.is-nested {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: calc(-0.35rem + var(--depth-offset, 0rem));
      top: 50%;
      width: 0.55rem;
      height: 1px;
      background: rgba(72, 95, 199, 0.2);
    }
  }

  &.is-system {
    cursor: default;
    border-left: 3px solid var(--bulma-primary, #485fc7);
    color: var(--bulma-text-light, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &:hover {
      background-color: transparent;
      transform: none;
    }
  }
}

.group-heading-main {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.79rem;
  font-weight: 720;
  letter-spacing: 0.015em;
  user-select: none;
}

.group-chevron,
.group-folder {
  flex: 0 0 auto;
}

.group-chevron {
  color: var(--bulma-text-light, #888);
}

.group-folder {
  color: var(--bulma-primary, #485fc7);
  opacity: 0.86;
}

.menu-label-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-count {
  display: inline-flex;
  min-width: 1.45rem;
  height: 1.15rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(72, 95, 199, 0.1);
  color: var(--bulma-primary, #485fc7);
  font-size: 0.7rem;
  font-weight: 760;
}

.group-list-wrap {
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  padding-left: calc(2.2rem + var(--depth-offset, 0rem));
  transition:
    grid-template-rows 0.25s ease,
    opacity 0.2s ease,
    margin 0.25s ease;

  &::before {
    content: '';
    position: absolute;
    left: calc(0.95rem + var(--depth-offset, 0rem));
    top: -0.1rem;
    bottom: 0.45rem;
    width: 1px;
    border-radius: 999px;
    background: rgba(72, 95, 199, 0.16);
  }

  &.is-collapsed {
    grid-template-rows: 0fr;
    opacity: 0;
    margin-bottom: -0.25rem;
    pointer-events: none;
  }

  .menu-list {
    min-height: 0;
    margin: 0.05rem 0 0.35rem;
    overflow: hidden;
  }

  &.is-system {
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--bulma-border-light, rgba(0, 0, 0, 0.05));
  }
}

.empty-group-note {
  padding: 0.45rem 0.75rem 0.65rem 0.2rem;
  margin: 0;
  color: var(--bulma-text-light, #94a3b8);
  font-size: 0.78rem;
}

.menu-list {
  margin-left: 0;

  li a {
    display: block;
    border-radius: 8px;
    padding: 0.42rem 0.65rem;
    margin-bottom: 0.12rem;
    position: relative;
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      background-color: var(--bulma-background-hover, rgba(15, 23, 42, 0.045));
      transform: translateX(1px);
    }

    &:focus-visible {
      outline: 2px solid var(--bulma-primary, #485fc7);
      outline-offset: 2px;
    }

    &.is-active {
      background-color: var(--bulma-primary-light, rgba(72, 95, 199, 0.08));
      color: var(--bulma-primary, #485fc7);
      box-shadow: inset 0 0 0 1px rgba(72, 95, 199, 0.12);
      font-weight: 650;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 18%;
        height: 64%;
        width: 3.5px;
        border-radius: 0 3px 3px 0;
        background-color: var(--bulma-primary, #485fc7);
      }
    }
  }
}

.tab-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;

  .tab-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge-count {
    margin-left: 0.5rem;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
}

@media (prefers-color-scheme: dark) {
  .menu-label-wrapper:hover,
  .menu-list li a:hover {
    background-color: rgba(148, 163, 184, 0.09);
  }

  .menu-label-wrapper.is-nested::before,
  .group-list-wrap::before {
    background: rgba(139, 92, 246, 0.22);
  }

  .group-count {
    background: rgba(148, 163, 184, 0.18);
    color: #e2e8f0;
  }

  .group-folder {
    color: #a78bfa;
  }
}
</style>
