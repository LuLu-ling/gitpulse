const MERMAID_PREVIEW_MIN_HEIGHT = 220;
const MERMAID_PREVIEW_MAX_HEIGHT = 640;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getMermaidSourceLines = (code: string) =>
  code
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const estimateMermaidPreviewHeight = (code: string) => {
  const lines = getMermaidSourceLines(code);
  const header = lines[0]?.toLowerCase() ?? '';
  const contentLineCount = Math.max(lines.length - 1, 1);

  if (/^(flowchart|graph)\b/.test(header)) {
    return clamp(180 + contentLineCount * 120, 280, MERMAID_PREVIEW_MAX_HEIGHT);
  }

  if (/^sequenceDiagram\b/i.test(header)) {
    return clamp(220 + contentLineCount * 44, 260, MERMAID_PREVIEW_MAX_HEIGHT);
  }

  if (/^(classDiagram|stateDiagram|erDiagram|journey|timeline|gantt|mindmap)\b/i.test(header)) {
    return clamp(220 + contentLineCount * 56, 260, MERMAID_PREVIEW_MAX_HEIGHT);
  }

  return clamp(220 + contentLineCount * 48, MERMAID_PREVIEW_MIN_HEIGHT, MERMAID_PREVIEW_MAX_HEIGHT);
};
