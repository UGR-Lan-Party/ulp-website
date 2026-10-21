import surveys from '../data/initial-surveys.json' with { type: 'json' };

const aliases = {
  'Wii Sports': 'Wii Sports (Tennis)',
  Pokémon: 'Pokémon / Showdown',
  'Pokémon Showdown': 'Pokémon / Showdown',
  'Super Smash Bros': 'Super Smash Bros.',
  'Super Smash Bros. Ultimate': 'Super Smash Bros.',
  'Rocket League (2vs2)': 'Rocket League',
  'Counter Strike: Global Offensive': 'Counter-Strike',
  'Counter Strike 2': 'Counter-Strike',
  FIFA: 'FIFA / EA Sports FC',
  'FIFA (EA Sports FC)': 'FIFA / EA Sports FC',
  'EA Sports FC': 'FIFA / EA Sports FC',
};

export const initialSurveys = surveys.map((survey) => ({
  ...survey,
  votes: Object.fromEntries(
    Object.entries(survey.votes).map(([name, count]) => [
      aliases[name] || name,
      count,
    ]),
  ),
}));

export function surveyChart({
  year = 'all',
  metric = 'percent',
  all = false,
} = {}) {
  const editions = initialSurveys.filter(
    (s) => year === 'all' || String(s.year) === String(year),
  );
  if (!editions.length || !['percent', 'votes'].includes(metric))
    throw new Error('Invalid survey selection');
  const names = [...new Set(editions.flatMap((s) => Object.keys(s.votes)))];
  const rows = names.map((name) => ({
    name,
    values: editions.map((s) => {
      const votes = s.votes[name] ?? null;
      return {
        year: s.year,
        votes,
        value:
          votes === null
            ? null
            : metric === 'votes'
              ? votes
              : (votes / s.responses) * 100,
      };
    }),
  }));
  rows.sort((a, b) => {
    const score = (row) =>
      initialSurveys.reduce(
        (total, edition) => total + (edition.votes[row.name] ?? 0),
        0,
      );
    return score(b) - score(a) || a.name.localeCompare(b.name, 'es');
  });
  const max =
    metric === 'percent'
      ? 100
      : Math.ceil(
          Math.max(...rows.flatMap((r) => r.values.map((v) => v.value ?? 0))) /
            10,
        ) * 10;
  const comparable =
    year === 'all'
      ? rows.filter((row) => row.values.every((point) => point.value !== null))
      : rows;
  return { editions, rows: all ? rows : comparable.slice(0, 8), max };
}

export function surveyLabel(point, metric) {
  if (point.value === null) return 'No se preguntó';
  return metric === 'votes'
    ? `${point.votes} votos`
    : `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(point.value)} %`;
}
