import type { CustomTab } from '#shared/types/custom-search';
import type { TabGroup } from '#shared/types/tab-groups';

export const APP_FONT_IDS = ['harmonyos-sans', 'misans-latin', 'system'] as const;
export const CODE_FONT_IDS = ['maple-mono', 'jetbrains-mono', 'system'] as const;
export const SHIKI_LIGHT_THEME_IDS = [
  'github-light',
  'light-plus',
  'min-light',
  'vitesse-light',
  'catppuccin-latte',
  'rose-pine-dawn',
] as const;
export const SHIKI_DARK_THEME_IDS = [
  'github-dark',
  'dark-plus',
  'min-dark',
  'vitesse-dark',
  'catppuccin-mocha',
  'nord',
  'dracula',
  'one-dark-pro',
] as const;

export type AppFontId = (typeof APP_FONT_IDS)[number];
export type CodeFontId = (typeof CODE_FONT_IDS)[number];
export type ShikiLightThemeId = (typeof SHIKI_LIGHT_THEME_IDS)[number];
export type ShikiDarkThemeId = (typeof SHIKI_DARK_THEME_IDS)[number];
export type ShikiThemeId = ShikiLightThemeId | ShikiDarkThemeId;

export interface UserFontSettings {
  appFont: AppFontId;
  codeFont: CodeFontId;
  appSystemFont?: string;
  codeSystemFont?: string;
}

export interface UserAppearanceSettings {
  shikiLightTheme: ShikiLightThemeId;
  shikiDarkTheme: ShikiDarkThemeId;
}

export interface UserSettings {
  version: 1;
  fonts: UserFontSettings;
  appearance: UserAppearanceSettings;
  tabGroups: TabGroup[];
  customTabs: CustomTab[];
  updatedAt?: string;
}

export interface UserSettingsPatch {
  fonts?: Partial<UserFontSettings>;
  appearance?: Partial<UserAppearanceSettings>;
  tabGroups?: TabGroup[];
  customTabs?: CustomTab[];
}
