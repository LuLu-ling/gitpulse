const HTML_BLOCK_TAGS = new Set([
  'div',
  'span',
  'p',
  'table',
  'tr',
  'td',
  'th',
  'thead',
  'tbody',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
]);

export default function fixHtmlBlockIndentation() {
  return {
    name: 'fix-html-block-indentation',
    pre(state: { markdown: string }) {
      const lines = state.markdown.split('\n');
      const result: string[] = [];
      let inHtmlBlock = false;
      let htmlBlockTag = '';

      for (const line of lines) {
        const trimmed = line.trimStart();

        if (!inHtmlBlock) {
          const openMatch = trimmed.match(/^<(\w+)[\s>]/);
          if (openMatch && HTML_BLOCK_TAGS.has(openMatch[1].toLowerCase())) {
            inHtmlBlock = true;
            htmlBlockTag = openMatch[1].toLowerCase();
          }
          result.push(line);
        } else {
          const closeRegex = new RegExp(`^</${htmlBlockTag}\\s*>`);
          if (trimmed.match(closeRegex)) {
            inHtmlBlock = false;
            htmlBlockTag = '';
            result.push(line);
          } else if (trimmed.startsWith('<')) {
            result.push(trimmed);
          } else {
            result.push(line);
          }
        }
      }

      state.markdown = result.join('\n');
    },
  };
}
