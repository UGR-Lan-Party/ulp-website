import { Competitions } from '../data/competitions-data';
import survey from '../data/competition-survey-2026.json';

const votes: Record<string, number> = survey.votes;

export function getActivitiesByTag(tag: string) {
  const games = Competitions.filter((game) => game.tag === tag);
  return tag === 'competicion'
    ? games.toSorted(
        (first, second) => (votes[second.id] ?? -1) - (votes[first.id] ?? -1),
      )
    : games;
}

export function getActivityNeighbors(id: string, tag: string) {
  const games = getActivitiesByTag(tag);
  const index = games.findIndex((game) => game.id === id);
  if (games.length < 2 || index < 0) return null;
  return {
    previous: games[(index + games.length - 1) % games.length],
    next: games[(index + 1) % games.length],
  };
}
