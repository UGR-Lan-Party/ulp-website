import data from './program-2026.json';
import { formatSlot, formatTime, validateProgram } from '../utils/program.js';

validateProgram(data);

export const programEdition = { year: data.year, timezone: data.timezone };

export const program = [
  ...data.games.map((game) => ({
    id: game.id,
    name: game.name,
    location: game.place,
    category: game.tag,
    href: `/actividades/${game.id}`,
    slots: game.schedule,
  })),
  ...data.talks.map((talk) => ({
    id: talk.id,
    name: talk.nombre,
    location: talk.ubicacion,
    category: 'charla',
    href: null,
    slots: [talk.slot],
  })),
]
  .flatMap((entry) =>
    entry.slots.map((slot) => ({
      ...entry,
      ...slot,
      time: formatSlot(slot, data.timezone),
    })),
  )
  .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

export const saturdaySchedule = data.saturday.map(
  ({ slot, ...entry }, index) => ({
    ...entry,
    id: index,
    inicio: formatTime(slot.startsAt, data.timezone),
    fin: formatTime(slot.endsAt, data.timezone),
  }),
);
