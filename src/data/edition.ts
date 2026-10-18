export interface Edition {
  year: number;
  number: number;
  phase: 'announced' | 'registration-open' | 'live' | 'finished';
  timezone: string;
  startsAt: string | null;
  endsAt: string | null;
  archiveUrl: string;
}

export const edition: Edition = {
  year: 2026,
  number: 8,
  phase: 'finished',
  timezone: 'Europe/Madrid',
  startsAt: '2026-03-20T15:45:00+01:00',
  endsAt: '2026-03-21T22:00:00+01:00',
  archiveUrl: '/ediciones/2026',
};
