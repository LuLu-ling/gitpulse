<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import { shallowRef } from 'vue';

import MarkdownRendererProseA from '~/components/ui/MarkdownRendererProseA.vue';
import useGitHubAutolinks from '~/composables/useGitHubAutolinks';

const props = defineProps<{
  value: string;
  repoOwner?: string;
  repoName?: string;
}>();

const ast = shallowRef<Awaited<ReturnType<typeof parseMarkdown>> | null>(null);
const renderRequestId = shallowRef(0);
const { applyGitHubAutolinks } = useGitHubAutolinks();

const rendererComponents = {
  a: MarkdownRendererProseA,
};

watch(
  () => [props.value, props.repoOwner, props.repoName],
  async ([value, repoOwner, repoName]) => {
    const requestId = renderRequestId.value + 1;
    renderRequestId.value = requestId;

    if (!value) {
      ast.value = null;
      return;
    }

    const parsedMarkdown = await parseMarkdown(value);

    await applyGitHubAutolinks(parsedMarkdown.body, {
      repoOwner,
      repoName,
    });

    if (requestId !== renderRequestId.value) {
      return;
    }

    ast.value = parsedMarkdown;
  },
  { immediate: true }
);
</script>

<template>
  <MDCRenderer
    v-if="ast"
    class="markdown-body"
    :body="ast.body"
    :data="ast.data"
    :components="rendererComponents"
  />
</template>

<style lang="scss" src="@primer/css/color-modes/themes/light.scss" />
<style lang="scss" src="@primer/css/primitives/index.scss" />
<style lang="scss" src="@primer/css/markdown/index.scss" />
<style lang="scss">
.markdown-body {
  font-size: 14px;
  hr {
    display: revert;
  }
  h3:not(:first-child) {
    margin-top: revert;
  }
  code {
    color: revert;
    font-weight: revert;
  }
  blockquote:not(:last-child) {
    margin-bottom: revert;
  }
  blockquote {
    background-color: revert;
  }
  a {
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }
  ul {
    list-style: none;
    margin-inline-start: revert;
    padding-left: 1em;
  }
}
</style>
