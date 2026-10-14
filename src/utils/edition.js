export function getEditionPresentation(edition) {
  const dates =
    edition.startsAt && edition.endsAt
      ? new Intl.DateTimeFormat('es-ES', {
          dateStyle: 'long',
          timeZone: edition.timezone,
        }).formatRange(new Date(edition.startsAt), new Date(edition.endsAt))
      : 'Fechas por confirmar';
  const actions = {
    announced: { label: 'Conocer la ULP', href: '/info/about' },
    'registration-open': {
      label: 'Ver actividades e inscribirme',
      href: '/actividades',
    },
    live: { label: 'Consultar el programa', href: '/info/horarios' },
    finished: {
      label: `Ver edición ${edition.year}`,
      href: edition.archiveUrl,
    },
  };
  return { dates, action: actions[edition.phase] };
}
