import { partners } from '../data/sponsors';
export const partnerAnchor = (name: string) =>
  `partner-${name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
export const getActivityPartners = (id: string) =>
  partners.filter((partner) =>
    partner.activities?.some((activity) => activity.id === id),
  );
