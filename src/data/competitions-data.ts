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

export const Competitions: CompetitionData[] = data.games.map(
  ({ schedule, card, ...game }) => ({
    ...game,
    schedule: schedule.map((slot) => ({
      time: formatSlot(slot, data.timezone),
      round: slot.label,
    })),
  }),
);

export const CompetitionsCards: CompetitionCardData[] = data.games.map(
  (game) => ({
    id: game.id,
    type: game.tag,
    ...game.card,
  }),
);
