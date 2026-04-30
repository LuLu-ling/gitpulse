<script setup lang="ts">
import { useId, shallowRef, onMounted, watch } from 'vue';

const props = defineProps<{
  code: string;
}>();

const MAX_SOURCE_BYTES = 16384;

type State = { kind: 'loading' } | { kind: 'success'; svg: string } | { kind: 'fallback' };

const state = shallowRef<State>({ kind: 'loading' });

// useId() is Vue 3.5+ — generates a stable, unique id per component instance.
const instanceId = useId();
const renderId = `mermaid-${instanceId.replace(/[^a-zA-Z0-9-]/g, '-')}`;

async function render(code: string) {
  if (!import.meta.client) return;

  // 16 KB source guard — silently fall back for oversized diagrams.
  if (code.length > MAX_SOURCE_BYTES) {
    state.value = { kind: 'fallback' };
    return;
  }

  state.value = { kind: 'loading' };

  try {
    const mermaid = (await import('mermaid')).default;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

    // Strict parse — throws on invalid syntax.
    await mermaid.parse(code);

    const { svg } = await mermaid.render(renderId, code);
    state.value = { kind: 'success', svg };
  } catch {
    // Silent fallback — never log Error to console per plan AC2.
    state.value = { kind: 'fallback' };
  }
}

onMounted(() => render(props.code));
watch(() => props.code, render);
</script>

<template>
  <ClientOnly>
    <!-- Skeleton placeholder while loading — reserved height prevents layout shift -->
    <template v-if="state.kind === 'loading'">
      <div class="mermaid-skeleton" />
    </template>

    <!-- Successful SVG render — v-html, no DOMPurify overlay (securityLevel:'strict' is sufficient) -->
    <template v-else-if="state.kind === 'success'">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="mermaid-output" v-html="state.svg" />
    </template>

    <!-- Silent fallback for parse errors / oversized source -->
    <template v-else>
      <pre><code class="language-mermaid">{{ code }}</code></pre>
    </template>

    <!-- SSR slot: render raw code block until client hydrates -->
    <template #fallback>
      <pre><code class="language-mermaid">{{ code }}</code></pre>
    </template>
  </ClientOnly>
</template>

<style>
.mermaid-skeleton {
  width: 100%;
  min-height: 160px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.mermaid-output {
  overflow-x: auto;
}

.mermaid-output svg {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
