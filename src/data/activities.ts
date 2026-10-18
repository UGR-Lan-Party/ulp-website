import data from './program-2026.json';
import { formatTime } from '../utils/program.js';

import type { RRSSLink } from '../data/sponsors.ts';
export interface Activity {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  horario: { inicio: string; fin: string };
  logo: string;
  ponentes: {
    nombre: string;
    role: string;
    links: RRSSLink[];
    image: string;
  }[];
  aforo: string;
  imagenes: string[];
  color: string;
}

export const activities: Activity[] = data.talks.map(
  ({ id, slot, ...activity }) => ({
    ...activity,
    horario: {
      inicio: formatTime(slot.startsAt, data.timezone),
      fin: formatTime(slot.endsAt, data.timezone),
    },
  }),
);
