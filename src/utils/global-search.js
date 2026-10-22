export function normalizeSearch(value) {
  return String(value ?? '')
    .slice(0, 2000)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}
export function safeInternalHref(value) {
  if (
    typeof value !== 'string' ||
    value.length > 1200 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return null;
  try {
    const url = new URL(value, 'https://ulp.ugr.es');
    return url.origin === 'https://ulp.ugr.es'
      ? url.pathname + url.search + url.hash
      : null;
  } catch {
    return null;
  }
}
export function searchSite(entries, query) {
  const tokens = normalizeSearch(String(query ?? '').slice(0, 160))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12);
  if (!tokens.length)
    return entries.filter((entry) => entry.kind === 'Actividad').slice(0, 6);
  return entries
    .map((entry, index) => {
      const title = normalizeSearch(entry.title);
      const text = normalizeSearch(
        entry.title + ' ' + entry.description + ' ' + (entry.keywords ?? ''),
      );
      return {
        entry,
        index,
        score: tokens.every((token) => text.includes(token))
          ? tokens.reduce(
              (score, token) =>
                score +
                (title === token
                  ? 20
                  : title.startsWith(token)
                    ? 8
                    : title.includes(token)
                      ? 4
                      : 1),
              0,
            )
          : 0,
      };
    })
    .filter((result) => result.score && safeInternalHref(result.entry.href))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 12)
    .map((result) => result.entry);
}
