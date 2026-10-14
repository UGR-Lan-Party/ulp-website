export function getRegistrationState(activity, year, edition) {
  if (!activity.registration) return { label: 'N/A', href: null };
  const isOpen =
    year === edition.year &&
    edition.phase === 'registration-open' &&
    activity.registrationPeriodOpen;
  return isOpen
    ? { label: 'Inscribirme', href: activity.registration }
    : { label: 'Cerrada', href: null };
}
