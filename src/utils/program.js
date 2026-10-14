export function formatTime(instant, timezone) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(instant));
}

export function formatSlot(slot, timezone) {
  const start = formatTime(slot.startsAt, timezone);
  const time = slot.endsAt
    ? `${start}–${formatTime(slot.endsAt, timezone)}`
    : start;
  return slot.allDay ? `Todo el día (${time})` : time;
}

export function validateProgram(data) {
  const ids = new Set();
  const entries = [...data.games, ...data.talks, ...data.saturday];
  for (const entry of entries) {
    if (!entry.id || ids.has(entry.id))
      throw new Error(
        `Identificador de actividad duplicado o vacío: ${entry.id}`,
      );
    ids.add(entry.id);
    const slots = entry.schedule ?? [entry.slot];
    for (const slot of slots) {
      const start = Date.parse(slot.startsAt);
      const end = slot.endsAt === null ? null : Date.parse(slot.endsAt);
      if (
        !Number.isFinite(start) ||
        (end !== null && (!Number.isFinite(end) || end <= start))
      ) {
        throw new Error(`Fecha o intervalo inválido: ${entry.id}`);
      }
      if (
        !/([+-]\d{2}:\d{2}|Z)$/.test(slot.startsAt) ||
        (slot.endsAt && !/([+-]\d{2}:\d{2}|Z)$/.test(slot.endsAt))
      ) {
        throw new Error(`Falta zona horaria: ${entry.id}`);
      }
    }
  }
  for (const game of data.games) {
    if (!game.card)
      throw new Error(`Falta tarjeta para la actividad: ${game.id}`);
  }
}
