<script setup lang="ts">
const route = useRoute();
const localePath = useLocalePath();

const owner = computed(() => String(route.params.owner ?? ''));
const repo = computed(() => String(route.params.repo ?? ''));

await navigateTo(
  localePath({
    path: '/dashboard',
    query: {
      tab: 'repos',
      repo: `${owner.value}/${repo.value}`,
    },
  }),
  { replace: true }
);
</script>

<template>
  <div />
</template>
