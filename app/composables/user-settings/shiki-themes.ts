import type { ThemeRegistration } from 'shiki';

import type {
  ShikiDarkThemeId,
  ShikiLightThemeId,
  ShikiThemeId,
} from '#shared/types/user-settings';

export interface ShikiThemeOption<T extends string> {
  id: T;
  label: string;
}

export const shikiLightThemeOptions: ShikiThemeOption<ShikiLightThemeId>[] = [
  { id: 'github-light', label: 'GitHub Light' },
  { id: 'light-plus', label: 'Light Plus' },
  { id: 'min-light', label: 'Min Light' },
  { id: 'vitesse-light', label: 'Vitesse Light' },
  { id: 'catppuccin-latte', label: 'Catppuccin Latte' },
  { id: 'rose-pine-dawn', label: 'Rosé Pine Dawn' },
];

export const shikiDarkThemeOptions: ShikiThemeOption<ShikiDarkThemeId>[] = [
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'dark-plus', label: 'Dark Plus' },
  { id: 'min-dark', label: 'Min Dark' },
  { id: 'vitesse-dark', label: 'Vitesse Dark' },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
  { id: 'nord', label: 'Nord' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'one-dark-pro', label: 'One Dark Pro' },
];

const shikiThemeLoaders: Record<ShikiThemeId, () => Promise<{ default: ThemeRegistration }>> = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'light-plus': () => import('@shikijs/themes/light-plus'),
  'min-light': () => import('@shikijs/themes/min-light'),
  'vitesse-light': () => import('@shikijs/themes/vitesse-light'),
  'catppuccin-latte': () => import('@shikijs/themes/catppuccin-latte'),
  'rose-pine-dawn': () => import('@shikijs/themes/rose-pine-dawn'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
  'dark-plus': () => import('@shikijs/themes/dark-plus'),
  'min-dark': () => import('@shikijs/themes/min-dark'),
  'vitesse-dark': () => import('@shikijs/themes/vitesse-dark'),
  'catppuccin-mocha': () => import('@shikijs/themes/catppuccin-mocha'),
  nord: () => import('@shikijs/themes/nord'),
  dracula: () => import('@shikijs/themes/dracula'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
};

const shikiThemeCache = new Map<ShikiThemeId, Promise<ThemeRegistration>>();

export function loadShikiTheme(themeId: ShikiThemeId) {
  let theme = shikiThemeCache.get(themeId);
  if (!theme) {
    theme = shikiThemeLoaders[themeId]().then((module) => module.default);
    shikiThemeCache.set(themeId, theme);
  }

  return theme;
}
