import { describe, expect, test } from 'bun:test';

import { estimateMermaidPreviewHeight } from '../shared/utils/mermaid-preview-height';

describe('mermaid preview height estimation', () => {
  test('keeps tiny diagrams compact', () => {
    expect(estimateMermaidPreviewHeight('flowchart TD\nA --> B')).toBe(300);
  });

  test('caps tall flowcharts to the inline preview height', () => {
    const code = ['flowchart TD', 'A --> B', 'B --> C', 'C --> D', 'D --> E', 'E --> F'].join('\n');

    expect(estimateMermaidPreviewHeight(code)).toBe(640);
  });

  test('uses a lighter estimate for sequence diagrams', () => {
    const code = ['sequenceDiagram', 'Alice->>Bob: Ping', 'Bob-->>Alice: Pong'].join('\n');

    expect(estimateMermaidPreviewHeight(code)).toBe(308);
  });
});
