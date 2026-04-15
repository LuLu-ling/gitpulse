<template>
  <nav
    class="pagination is-centered is-rounded dashboard-pagination"
    role="navigation"
    aria-label="pagination"
  >
    <button
      class="pagination-previous"
      :disabled="!canGoPrev"
      @click="emit('change', pagination.page - 1)"
    >
      {{ t('dashboard.pagination.previous') }}
    </button>

    <button
      class="pagination-next"
      :disabled="!canGoNext"
      @click="emit('change', pagination.page + 1)"
    >
      {{ t('dashboard.pagination.next') }}
    </button>

    <ul class="pagination-list">
      <li v-for="item in pageItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'" class="pagination-ellipsis">&hellip;</span>
        <button
          v-else
          :class="['pagination-link', { 'is-current': item.page === pagination.page }]"
          :aria-current="item.page === pagination.page ? 'page' : undefined"
          @click="emit('change', item.page)"
        >
          {{ item.page }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface PaginationMeta {
  page: number;
  perPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalCount: number | null;
  totalPages: number | null;
}

interface PaginationPageItem {
  key: string;
  type: 'page' | 'ellipsis';
  page: number;
}

const props = defineProps<{
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (e: 'change', page: number): void;
}>();

const { t } = useI18n();

const canGoPrev = computed(() => props.pagination.hasPrev);
const canGoNext = computed(() => props.pagination.hasNext);

const buildKnownPageItems = (totalPages: number, currentPage: number) => {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: PaginationPageItem[] = [];

  for (const page of sortedPages) {
    const previousPage = items[items.length - 1]?.page;

    if (previousPage && page - previousPage > 1) {
      items.push({
        key: `ellipsis-${previousPage}-${page}`,
        type: 'ellipsis',
        page,
      });
    }

    items.push({
      key: `page-${page}`,
      type: 'page',
      page,
    });
  }

  return items;
};

const pageItems = computed(() => {
  const { page, totalPages, hasNext } = props.pagination;

  if (!totalPages) {
    return [
      { key: `page-${page}`, type: 'page' as const, page },
      ...(hasNext ? [{ key: `page-${page + 1}`, type: 'page' as const, page: page + 1 }] : []),
    ];
  }

  return buildKnownPageItems(totalPages, page);
});
</script>

<style scoped lang="scss">
.dashboard-pagination {
  margin: 0;
}

.pagination-link,
.pagination-previous,
.pagination-next {
  background: white;
}

.pagination-link.is-current {
  background: #0969da;
  border-color: transparent;
  color: #ffffff;
  font-weight: 600;
}

.pagination-link.is-current:hover,
.pagination-link.is-current:focus {
  background: #0757b3;
  color: #ffffff;
}

.pagination-link,
.pagination-previous,
.pagination-next,
.pagination-ellipsis {
  min-height: 2.5rem;
}
</style>
