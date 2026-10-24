import { program, programEdition } from '../data/program';
export function getActivitySocial(id: string, name: string) {
  const slots = program.filter(
    (entry) => entry.id === id || entry.href === `/actividades/${id}`,
  );
  const first = slots[0];
  const date = first
    ? new Intl.DateTimeFormat('es-ES', {
        timeZone: programEdition.timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(first.startsAt))
    : 'Fecha por confirmar';
  const time = first
    ? new Intl.DateTimeFormat('es-ES', {
        timeZone: programEdition.timezone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(first.startsAt))
    : '';
  return {
    year: programEdition.year,
    date,
    time,
    location: first?.location ?? 'Ubicación por confirmar',
    description: `${name} · ULP ${programEdition.year}. ${date}${time ? `, desde las ${time}` : ''}. ${first?.location ?? 'Ubicación por confirmar'}.`,
  };
}
