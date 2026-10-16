const publicFields = new Set([
  'brackets',
  'rounds',
  'scores',
  'winner',
  'nextId',
  'edition',
  'updatedAt',
  'tournaments',
  'id',
  'format',
  'stages',
  'participants',
  'participantLabel',
  'notice',
  'officialUrl',
  'groups',
  'tables',
  'name',
  'time',
  'matches',
  'players',
  'columns',
  'rows',
]);

export function validateTournaments(data) {
  function inspect(value) {
    if (typeof value === 'string') {
      if (
        /@/.test(value) ||
        (!/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          /\b\+?\d[\d ()-]{7,}\d\b/.test(value))
      )
        throw new Error('El cuadro contiene un correo o un posible teléfono.');
      return;
    }
    if (Array.isArray(value)) return value.forEach(inspect);
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (!publicFields.has(key)) throw new Error(`Campo no público: ${key}`);
        inspect(item);
      }
    }
  }
  inspect(data);
  if (!Number.isInteger(data.edition) || !Array.isArray(data.tournaments))
    throw new Error('Datos de torneos incompletos.');
  const ids = new Set();
  for (const tournament of data.tournaments) {
    if (!tournament.id || ids.has(tournament.id))
      throw new Error('Identificador de torneo ausente o duplicado.');
    ids.add(tournament.id);
    if (tournament.officialUrl) {
      const url = new URL(tournament.officialUrl);
      if (
        url.protocol !== 'https:' ||
        !['challonge.com', 'www.start.gg', 'start.gg', 'smash.gg'].includes(
          url.hostname,
        )
      )
        throw new Error('Enlace de cuadro oficial no permitido.');
    }
    const matches = new Set();
    for (const group of tournament.groups) {
      for (const match of group.matches) {
        if (
          matches.has(match.id) ||
          match.players.length !== 2 ||
          match.players[0] === match.players[1] ||
          match.players.some((player) => !group.participants.includes(player))
        )
          throw new Error(`Cruce inválido: ${match.id}`);
        matches.add(match.id);
      }
    }
    for (const bracket of tournament.brackets) {
      const matches = bracket.rounds.flatMap((round, index) =>
        round.matches.map((match) => ({ ...match, roundIndex: index })),
      );
      const byId = new Map(matches.map((match) => [match.id, match]));
      if (byId.size !== matches.length) throw new Error('Partidos duplicados.');
      for (const match of matches) {
        if (
          match.players.length !== 2 ||
          match.scores.length !== 2 ||
          match.players[0] === match.players[1] ||
          match.scores.some((score) => !Number.isInteger(score)) ||
          (match.winner && !match.players.includes(match.winner))
        )
          throw new Error(`Partido inválido: ${match.id}`);
        if (match.nextId) {
          const next = byId.get(match.nextId);
          if (
            !next ||
            next.roundIndex <= match.roundIndex ||
            !match.winner ||
            !next.players.includes(match.winner)
          )
            throw new Error(`Avance de ronda inválido: ${match.id}`);
        }
      }
    }
    for (const table of tournament.tables) {
      if (table.rows.some((row) => row.length !== table.columns.length))
        throw new Error(`Columnas inconsistentes: ${table.id}`);
    }
  }
  return data;
}
