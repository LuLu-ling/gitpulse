import { watch } from 'vue';

export type CustomTabState = 'open' | 'closed' | 'all';

export interface CustomTabQuery {
  repo?: string;
  labels?: string[];
  author?: string;
  state?: CustomTabState;
}

export interface CustomTab {
  id: string;
  groupId: string;
  name: string;
  query: CustomTabQuery;
}

export interface CreateCustomTabInput {
  id?: string;
  groupId: string;
  name: string;
  query?: CustomTabQuery;
}

export interface UpdateCustomTabInput {
  groupId?: string;
  name?: string;
  query?: CustomTabQuery;
}

const STORAGE_KEY = 'gitpulse:dashboard:custom-tabs';

const DEFAULT_CUSTOM_TABS: CustomTab[] = [];

let hasHydratedStoredTabs = false;

const cloneQuery = (query: CustomTabQuery = {}) => {
  return {
    ...query,
    labels: query.labels ? [...query.labels] : undefined,
  };
};

const cloneTab = (tab: CustomTab): CustomTab => {
  return {
    ...tab,
    query: cloneQuery(tab.query),
  };
};

const cloneTabs = (tabs: CustomTab[]) => {
  return tabs.map((tab) => cloneTab(tab));
};

const normalizeQuery = (query: unknown): CustomTabQuery => {
  if (!query || typeof query !== 'object') {
    return {};
  }

  const candidate = query as Partial<CustomTabQuery>;
  const state = candidate.state;
  const normalizedState =
    state === 'open' || state === 'closed' || state === 'all' ? state : undefined;

  const labels = Array.isArray(candidate.labels)
    ? candidate.labels.filter(
        (label): label is string => typeof label === 'string' && label.length > 0
      )
    : undefined;

  return {
    repo:
      typeof candidate.repo === 'string' && candidate.repo.length > 0 ? candidate.repo : undefined,
    labels,
    author:
      typeof candidate.author === 'string' && candidate.author.length > 0
        ? candidate.author
        : undefined,
    state: normalizedState,
  };
};

const normalizeTab = (tab: unknown): CustomTab | null => {
  if (!tab || typeof tab !== 'object') {
    return null;
  }

  const candidate = tab as Partial<CustomTab>;
  if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
    return null;
  }

  if (typeof candidate.groupId !== 'string' || candidate.groupId.length === 0) {
    return null;
  }

  if (typeof candidate.name !== 'string' || candidate.name.length === 0) {
    return null;
  }

  return {
    id: candidate.id,
    groupId: candidate.groupId,
    name: candidate.name,
    query: normalizeQuery(candidate.query),
  };
};

const readStoredTabs = (): CustomTab[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const tabs = parsed
      .map((entry) => normalizeTab(entry))
      .filter((entry): entry is CustomTab => entry !== null);
    return tabs;
  } catch {
    return null;
  }
};

const writeStoredTabs = (tabs: CustomTab[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
};

const createTabId = () => {
  return `custom-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function useCustomTabs(initialTabs: CustomTab[] = DEFAULT_CUSTOM_TABS) {
  const customTabs = useState<CustomTab[]>('gitpulse-custom-tabs', () => cloneTabs(initialTabs));

  if (import.meta.client && !hasHydratedStoredTabs) {
    const storedTabs = readStoredTabs();
    customTabs.value = storedTabs ?? cloneTabs(initialTabs);
    hasHydratedStoredTabs = true;
  }

  watch(
    customTabs,
    (nextTabs) => {
      writeStoredTabs(nextTabs);
    },
    { deep: true }
  );

  const getCustomTabById = (tabId: string) => {
    return customTabs.value.find((tab) => tab.id === tabId);
  };

  const getCustomTabsByGroupId = (groupId: string) => {
    return customTabs.value.filter((tab) => tab.groupId === groupId);
  };

  const createCustomTab = (input: CreateCustomTabInput) => {
    const id = input.id && input.id.length > 0 ? input.id : createTabId();
    if (getCustomTabById(id)) {
      return null;
    }

    const tab: CustomTab = {
      id,
      groupId: input.groupId,
      name: input.name,
      query: cloneQuery(input.query),
    };

    customTabs.value = [...customTabs.value, tab];
    return tab;
  };

  const updateCustomTab = (tabId: string, updates: UpdateCustomTabInput) => {
    const target = getCustomTabById(tabId);
    if (!target) {
      return null;
    }

    const updatedTab: CustomTab = {
      ...target,
      ...updates,
      query: updates.query ? cloneQuery(updates.query) : target.query,
    };

    customTabs.value = customTabs.value.map((tab) => {
      if (tab.id !== tabId) {
        return tab;
      }

      return updatedTab;
    });

    return updatedTab;
  };

  const deleteCustomTab = (tabId: string) => {
    const exists = customTabs.value.some((tab) => tab.id === tabId);
    if (!exists) {
      return false;
    }

    customTabs.value = customTabs.value.filter((tab) => tab.id !== tabId);
    return true;
  };

  const resetCustomTabs = () => {
    customTabs.value = cloneTabs(initialTabs);
    return customTabs.value;
  };

  return {
    customTabs,
    getCustomTabById,
    getCustomTabsByGroupId,
    createCustomTab,
    updateCustomTab,
    deleteCustomTab,
    resetCustomTabs,
  };
}
