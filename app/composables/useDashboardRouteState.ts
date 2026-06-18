import type { LocationQueryRaw } from 'vue-router';

import getQueryParamValue from '../utils/getQueryParamValue';
import type { DashboardTab } from './useDashboardTabs';

export const dashboardTabs: DashboardTab[] = ['todos', 'notifications', 'issues', 'pulls', 'repos'];

export const parseDashboardTab = (value: unknown): DashboardTab => {
  const tab = getQueryParamValue(value);
  return dashboardTabs.includes(tab as DashboardTab) ? (tab as DashboardTab) : 'notifications';
};

export const parseDashboardPage = (value: unknown) => {
  const rawValue = getQueryParamValue(value);

  if (!rawValue || !/^\d+$/.test(rawValue)) {
    return 1;
  }

  const parsedPage = Number.parseInt(rawValue, 10);
  return Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
};

export const buildDashboardQuery = (query: LocationQueryRaw) => {
  const nextQuery: LocationQueryRaw = {};

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      nextQuery[key] = value;
    }
  }

  return nextQuery;
};
