<script setup lang="ts">
import Navbar from '~/components/layouts/Navbar.vue';

const route = useRoute();

const isFileBrowserActive = computed(() => {
  return Boolean(route.query.repo && Object.hasOwn(route.query, 'path'));
});
</script>

<template>
  <Navbar v-if="!isFileBrowserActive" />
  <section class="hero is-fullheight-with-navbar dashboard-shell">
    <div class="hero-body dashboard-shell__body">
      <NuxtPage />
    </div>
  </section>
</template>

<style scoped lang="scss">
.dashboard-shell__body {
  align-items: stretch;
}
</style>
