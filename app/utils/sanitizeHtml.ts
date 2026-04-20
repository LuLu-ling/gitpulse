import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['a', 'b', 'code', 'em', 'i', 's', 'strong', 'sub', 'sup', 'u'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}

export default sanitizeHtml;
