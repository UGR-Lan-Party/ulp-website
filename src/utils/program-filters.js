export function normalizeSearch(value) {
  return String(value ?? '')
    .slice(0, 120)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim()
    .replace(/\s+/g, ' ');
}

export function parseTime(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function matchesProgramFilters(entry, filters) {
  if (
    filters.name &&
    !normalizeSearch(entry.name).includes(normalizeSearch(filters.name))
  )
    return false;
  if (filters.location && entry.location !== filters.location) return false;
  if (filters.day && entry.day !== filters.day) return false;
  if (!filters.time) return true;
  const requested = parseTime(filters.time);
  const start = parseTime(entry.start);
  const end = parseTime(entry.end);
  if (requested === null || start === null) return false;
  if (end === null) return requested === start;
  return end < start
    ? requested >= start || requested < end
    : requested >= start && requested < end;
}
