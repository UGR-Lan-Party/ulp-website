export function getCountdown(startsAt, now = Date.now()) {
  const remaining = Date.parse(startsAt) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  return {
    days: String(Math.floor(remaining / 86400000)).padStart(2, '0'),
    hours: String(Math.floor((remaining % 86400000) / 3600000)).padStart(
      2,
      '0',
    ),
    minutes: String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0'),
  };
}
