import data from './program-2026.json';
import { formatSlot } from '../utils/program.js';
import { validateProgram } from '../utils/program.js';

validateProgram(data);

export interface CompetitionData {
  id: string;
  name: string;
  rules: string;
  registration: string;
  registrationPeriodOpen: boolean;
  participants: string;
  schedule: { time: string; round: string }[];
  place: string;
  tag: string;
  backgroundImage: string;
  trophy: string;
  awards?: Awards;
  description?: string;
}

export interface CompetitionCardData {
  id: string;
  card: string;
  logo: string;
  character: string;
  type: string;
}

export interface Awards {
  first: string[];
  second: string[];
  third: string[];
  mvp?: string[];
}

const concert = data.talks.find((talk) => talk.id === 'charla-6')!;
const catalogGames = [
  ...data.games,
  {
    id: 'concierto',
    name: 'Concierto',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    place: concert.ubicacion,
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Las bandas sonoras de los videojuegos cobran vida con Orquesta Virtual Soul. Revive el concierto de música de videojuegos de ULP 2026.',
    schedule: [concert.slot],
    card: {
      card: '/assets/activities/concierto/orquesta-1600.webp',
      logo: '/assets/activities/concierto/virtual-soul-logo.png',
      character: '/assets/activities/concierto/virtual-soul-logo.png',
    },
  },
];

export const Competitions: CompetitionData[] = catalogGames.map(
  ({ schedule, card, ...game }) => ({
    ...game,
    schedule: schedule.map((slot) => ({
      time: formatSlot(slot, data.timezone),
      round: slot.label,
    })),
  }),
);

export const CompetitionsCards: CompetitionCardData[] = catalogGames.map(
  (game) => ({
    id: game.id,
    type: game.tag,
    ...game.card,
  }),
);
