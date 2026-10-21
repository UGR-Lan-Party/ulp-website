import { getTournamentFormat } from '../utils/tournament-format.js';
import data from './tournaments-2026.json';
import { validateTournaments } from '../utils/tournaments.js';

validateTournaments(data);

export interface TournamentGroup {
  id: string;
  name: string;
  time?: string;
  participants: string[];
  matches: { id: string; players: string[] }[];
}

export interface TournamentBracket {
  id: string;
  name: string;
  rounds: {
    name: string;
    matches: {
      id: string;
      players: string[];
      scores: number[];
      winner: string | null;
      nextId: string | null;
    }[];
  }[];
}

export interface Tournament {
  id: string;
  format: string;
  stages: string[];
  participants: string[];
  participantLabel: string;
  notice: string;
  officialUrl?: string;
  groups: TournamentGroup[];
  brackets: TournamentBracket[];
  tables: {
    id: string;
    name: string;
    columns: string[];
    rows: (string | number | null)[][];
  }[];
}

export function getTournament(activityId: string): Tournament | undefined {
  const recorded = data.tournaments.find(
    (tournament) => tournament.id === activityId,
  );
  if (activityId === 'league-of-legends' && recorded) return recorded;
  const format = getTournamentFormat(activityId);
  if (!format) return undefined;
  return {
    id: activityId,
    format: format.name,
    stages: [],
    notice: '',
    participants: [],
    participantLabel: 'Participantes',
    groups: [],
    brackets: [],
    tables: [],
  };
}
