export const agendaKey = (year) => `ulp-agenda:${year}:v1`;

export const agendaEntryId = (entry, year) =>
  `${year}:${entry.id}:${entry.startsAt}`;

export function parseAgenda(value, allowedIds) {
  try {
    const ids = JSON.parse(value ?? '[]');
    return new Set(
      Array.isArray(ids)
        ? ids.filter((id) => typeof id === 'string' && allowedIds.has(id))
        : [],
    );
  } catch {
    return new Set();
  }
}

export function findAgendaConflicts(entries) {
  const conflicts = [];
  for (let index = 0; index < entries.length; index++) {
    const first = entries[index];
    if (!first.endsAt) continue;
    for (const second of entries.slice(index + 1)) {
      if (
        second.endsAt &&
        Date.parse(first.startsAt) < Date.parse(second.endsAt) &&
        Date.parse(second.startsAt) < Date.parse(first.endsAt)
      )
        conflicts.push([first, second]);
    }
  }
  return conflicts;
}

const calendarText = (value) =>
  String(value)
    .replaceAll('\\', '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
const calendarDate = (value) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

function foldLine(line) {
  const encoder = new TextEncoder();
  let result = '';
  let length = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (length + bytes > 75) {
      result += '\r\n ';
      length = 1;
    }
    result += character;
    length += bytes;
  }
  return result;
}

export function createAgendaCalendar(entries, year, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UGR LAN Party//Agenda//ES',
    'CALSCALE:GREGORIAN',
  ];
  for (const entry of entries) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(entry.key)}@ulp.ugr.es`,
      `DTSTAMP:${calendarDate(now)}`,
      `DTSTART:${calendarDate(entry.startsAt)}`,
    );
    if (entry.endsAt) lines.push(`DTEND:${calendarDate(entry.endsAt)}`);
    lines.push(
      `SUMMARY:${calendarText(entry.name)} · ULP ${year}`,
      `LOCATION:${calendarText(entry.location)}`,
      `DESCRIPTION:${calendarText([entry.label, `Archivo ULP ${year}. Guardar en la agenda no equivale a inscribirse.`, !entry.endsAt && 'Hora de fin sin confirmar.'].filter(Boolean).join('\n'))}`,
    );
    if (entry.href) lines.push(`URL:https://ulp.ugr.es${entry.href}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
