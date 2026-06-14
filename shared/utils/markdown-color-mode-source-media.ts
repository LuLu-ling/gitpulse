const COLOR_SCHEME_MEDIA_PATTERN =
  /^\(\s*prefers-color-scheme\s*:\s*(dark|light|no-preference)\s*\)$/i;

function sourceMatchesColorMode(sourceScheme: string, colorMode: string) {
  const normalizedColorMode = colorMode === 'dark' ? 'dark' : 'light';

  return (
    sourceScheme === normalizedColorMode ||
    (normalizedColorMode === 'light' && sourceScheme === 'no-preference')
  );
}

function parseColorSchemeMedia(media: string) {
  const queries = media
    .split(',')
    .map((query) => query.trim())
    .filter(Boolean);
  if (queries.length === 0) {
    return null;
  }

  const schemes: string[] = [];
  for (const query of queries) {
    const scheme = query.match(COLOR_SCHEME_MEDIA_PATTERN)?.[1];
    if (!scheme) {
      return null;
    }
    schemes.push(scheme.toLowerCase());
  }

  return schemes;
}

export function resolveMarkdownColorModeSourceMedia(
  media: string | undefined,
  colorMode: string
): string | undefined {
  if (!media) {
    return media;
  }

  const schemes = parseColorSchemeMedia(media);
  if (!schemes) {
    return media;
  }

  return schemes.some((scheme) => sourceMatchesColorMode(scheme, colorMode)) ? 'all' : 'not all';
}
