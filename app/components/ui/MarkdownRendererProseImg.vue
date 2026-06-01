<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}>();

const runtimeConfig = useRuntimeConfig();

const refinedSrc = computed(() => {
  const src = props.src ?? '';
  const baseURL = runtimeConfig.app.baseURL || '/';
  const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

  if (
    src.startsWith('/') &&
    !src.startsWith('//') &&
    normalizedBase !== '/' &&
    !src.startsWith(normalizedBase)
  ) {
    return `${normalizedBase.slice(0, -1)}${src}`;
  }

  return src;
});
</script>

<template>
  <img :src="refinedSrc" :alt="props.alt ?? ''" :width="props.width" :height="props.height" />
</template>
