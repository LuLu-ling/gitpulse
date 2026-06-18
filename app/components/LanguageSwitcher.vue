<template>
  <FilterDropdown :options="localeOptions" :model-value="locale" @update:model-value="changeLang" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import FilterDropdown from '~/components/ui/FilterDropdown.vue';
import type { FilterOption } from '~/components/ui/FilterDropdown.vue';

const { locale, setLocale, locales } = useI18n();

type SupportedLocale = typeof locale.value;

const localeOptions = computed<FilterOption[]>(() =>
  locales.value.map((l) => ({
    value: l.code,
    label: l.name ?? l.code,
  }))
);

const isSupportedLocale = (code: string): code is SupportedLocale =>
  locales.value.some((l) => l.code === code);

const changeLang = (code: string) => {
  if (!isSupportedLocale(code)) return;
  setLocale(code);
};
</script>
