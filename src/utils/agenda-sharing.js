const catalogVersion = (entries) => {
  let hash = 2166136261;
  for (const character of entries.map((entry) => entry.key).join('\n'))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
};
export function encodeSharedAgenda(selected, entries, year) {
  const ids = entries.flatMap((entry, index) =>
    selected.has(entry.key) ? [index.toString(36)] : [],
  );
  return ids.length
    ? `v1.${year}.${catalogVersion(entries)}.${ids.join('-')}`
    : null;
}
export function decodeSharedAgenda(value, entries, year) {
  if (
    typeof value !== 'string' ||
    value.length > 1800 ||
    !/^v1\.\d{4}\.[0-9a-z]+\.[0-9a-z]+(?:-[0-9a-z]+)*$/.test(value)
  )
    return null;
  const [version, edition, revision, list] = value.split('.');
  if (
    version !== 'v1' ||
    edition !== String(year) ||
    revision !== catalogVersion(entries)
  )
    return null;
  const ids = list.split('-');
  if (ids.length > entries.length) return null;
  const indices = ids.map((id) => parseInt(id, 36));
  if (
    indices.some(
      (index) =>
        !Number.isSafeInteger(index) || index < 0 || index >= entries.length,
    )
  )
    return null;
  return new Set(indices.map((index) => entries[index].key));
}
export function createSharedAgendaUrl(selected, entries, year, origin) {
  const payload = encodeSharedAgenda(selected, entries, year);
  if (!payload) return null;
  const url = new URL('/info/horarios/', origin);
  url.hash = `agenda=${payload}`;
  return url.href;
}
