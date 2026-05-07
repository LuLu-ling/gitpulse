<template>
  <div class="tabs-settings-page">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <h1 class="title is-4 mb-0">Tab Settings</h1>
    </div>

    <!-- Create Group Form -->
    <div class="box mb-5">
      <h2 class="title is-5 mb-4">Create New Group</h2>
      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            v-model="newGroupName"
            class="input"
            type="text"
            placeholder="Enter group name"
            @keyup.enter="handleCreateGroup"
          />
        </div>
        <div class="control">
          <button
            class="button is-primary"
            :disabled="!newGroupName.trim()"
            @click="handleCreateGroup"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>

    <!-- Create Custom Tab Form -->
    <div class="box mb-5">
      <h2 class="title is-5 mb-4">Create New Custom Tab</h2>

      <div class="field">
        <label class="label">Tab Name *</label>
        <div class="control">
          <input
            v-model="newTab.name"
            class="input"
            type="text"
            placeholder="e.g. High Priority Bugs"
          />
        </div>
      </div>

      <div class="field">
        <label class="label">Group (Data Source) *</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="newTab.groupId">
              <option value="" disabled>Select a group...</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Repository</label>
            <div class="control">
              <input
                v-model="newTab.query.repo"
                class="input"
                type="text"
                placeholder="owner/repo"
              />
            </div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Author</label>
            <div class="control">
              <input
                v-model="newTab.query.author"
                class="input"
                type="text"
                placeholder="GitHub username"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Labels</label>
            <div class="control">
              <input
                v-model="labelsInput"
                class="input"
                type="text"
                placeholder="bug, help wanted (comma separated)"
              />
            </div>
            <p class="help">Comma-separated list of labels</p>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">State</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="newTab.query.state">
                  <option value="">Any</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field mt-4">
        <div class="control">
          <button
            class="button is-primary"
            :disabled="!newTab.name.trim() || !newTab.groupId"
            @click="handleCreateCustomTab"
          >
            Create Custom Tab
          </button>
        </div>
      </div>
    </div>

    <!-- List Groups and Tabs -->
    <div class="groups-list">
      <div v-for="group in groups" :key="group.id" class="box mb-5">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h3 class="title is-5 mb-0">{{ group.name }}</h3>
          <button
            v-if="group.id !== 'default'"
            class="button is-danger is-small"
            @click="handleDeleteGroup(group.id)"
          >
            Delete Group
          </button>
        </div>

        <table class="table is-fullwidth is-hoverable is-bordered">
          <thead>
            <tr>
              <th>Tab Name</th>
              <th style="width: 200px">Group</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tab in getTabsForGroup(group.id)" :key="tab.id">
              <td class="is-vcentered">{{ tab.name }}</td>
              <td>
                <div class="select is-small is-fullwidth">
                  <select v-model="tab.groupId">
                    <option v-for="g in groups" :key="g.id" :value="g.id">
                      {{ g.name }}
                    </option>
                  </select>
                </div>
              </td>
            </tr>
            <tr v-if="getTabsForGroup(group.id).length === 0">
              <td colspan="2" class="has-text-grey has-text-centered py-4">
                No tabs in this group
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useCustomTabs, type CustomTabState } from '~/composables/useCustomTabs';
import { useTabGroups } from '~/composables/useTabGroups';
import { useTabMigration } from '~/composables/useTabMigration';

// Setup composables
const { groups, createGroup, deleteGroup } = useTabGroups();
const { tabs } = useTabMigration();
const { createCustomTab } = useCustomTabs();

const newGroupName = ref('');

const newTab = ref({
  name: '',
  groupId: '',
  query: {
    repo: '',
    author: '',
    state: '' as CustomTabState | '',
  },
});

const labelsInput = ref('');

const handleCreateCustomTab = () => {
  const name = newTab.value.name.trim();
  if (!name || !newTab.value.groupId) return;

  const labels = labelsInput.value
    .split(',')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  createCustomTab({
    name,
    groupId: newTab.value.groupId,
    query: {
      repo: newTab.value.query.repo.trim() || undefined,
      author: newTab.value.query.author.trim() || undefined,
      state: newTab.value.query.state || undefined,
      labels: labels.length > 0 ? labels : undefined,
    },
  });

  // Reset form
  newTab.value = {
    name: '',
    groupId: '',
    query: {
      repo: '',
      author: '',
      state: '',
    },
  };
  labelsInput.value = '';
};

const handleCreateGroup = () => {
  const name = newGroupName.value.trim();
  if (name) {
    createGroup({ name });
    newGroupName.value = '';
  }
};

const handleDeleteGroup = (groupId: string) => {
  // Move all tabs to default group before deleting
  const groupTabs = tabs.value.filter((tab) => tab.groupId === groupId);
  groupTabs.forEach((tab) => {
    tab.groupId = 'default';
  });

  // Delete the group
  deleteGroup(groupId);
};

const getTabsForGroup = (groupId: string) => {
  return tabs.value.filter((tab) => tab.groupId === groupId);
};
</script>

<style scoped>
.tabs-settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
