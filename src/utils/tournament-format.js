// Presentation models only. Never infer pairings or results from registration order.
export const tournamentFormats = {
  ajedrez: {
    minimum: 8,
    step: 1,
    name: 'Sistema suizo',
    kind: 'swiss',
    capacity: 32,
    note: 'El reglamento propone sistema suizo; el número de rondas se acuerda según participación. La simulación propone las rondas y no representa un sorteo confirmado.',
    source: 'Reglamento Ajedrez · ULP 2026',
  },
  minecraft: {
    minimum: 8,
    step: 2,
    name: 'UHC + Hunger Games',
    kind: 'survival',
    capacity: 32,
    note: 'UHC por parejas y cinco partidas de Hunger Games. La clasificación combina bajas y posición; no hay eliminación directa.',
    source: 'Reglamento Minecraft · ULP 2026, §3.3',
  },
  'mario-kart': {
    minimum: 8,
    step: 1,
    name: 'Supervivencia + Grand Prix',
    kind: 'race',
    capacity: 64,
    note: 'Series de cuatro jugadores; pasan los dos primeros. Tras Supervivencia se disputa Grand Prix de cuatro carreras. Las series se ajustan a las plazas.',
    source: 'Reglamento Mario Kart World · ULP 2026',
  },
  'league-of-legends': {
    minimum: 8,
    step: 1,
    name: 'Grupos + repesca + eliminatorias',
    kind: 'lol',
    capacity: 12,
    note: 'Grupos de hasta cuatro equipos, a una vuelta y BO1. Los primeros pasan; la repesca entre segundos completa el cuadro. Semifinales por sorteo. El texto de formato prevalece sobre la cifra de plazas contradictoria del documento.',
    source: 'Reglamento LoL · ULP 2026, §2.1',
  },
  'rocket-league': {
    minimum: 8,
    step: 1,
    name: 'Grupos + eliminatorias',
    kind: 'rocket',
    capacity: 10,
    note: 'Parejas: grupos de hasta cinco equipos BO3; pasan dos por grupo. Eliminatorias BO5, ordenadas por diferencia de partidos y sorteo en caso de empate. El formato descrito prevalece sobre la cifra de inscripción.',
    source: 'Reglamento Rocket League · ULP 2026 (documento de organización)',
  },
  'wii-sports-tenis': {
    minimum: 12,
    step: 1,
    name: 'Suizo + repesca + fase final',
    kind: 'tennis',
    capacity: 36,
    note: 'Tres grupos suizos de tres rondas. Con cero o una victoria se pasa por la repesca. El tamaño de la fase final depende de esos resultados y no se puede deducir solo de las plazas.',
    source: 'Reglamento Wii Sports Tenis · ULP 2026',
  },
  'wii-sports-bolos': {
    minimum: 16,
    step: 1,
    name: 'Clasificación por puntuación',
    kind: 'bowling',
    capacity: 36,
    note: 'Turnos simultáneos de cuatro: seis lanzamientos en clasificación, corte a 16, otros seis y final de ocho a diez lanzamientos.',
    source: 'Reglamento Wii Sports Bolos · ULP 2026',
  },
  smash: {
    minimum: 8,
    step: 1,
    name: 'Doble eliminación · BO5',
    kind: 'double',
    capacity: 16,
    note: 'Cuadro de ganadores y repesca. Segunda derrota elimina; gran final y posible reinicio si gana quien llega de repesca. Todos los nombres del modelo son TBD.',
    source: 'Reglamento Super Smash Bros. Ultimate · ULP 2026',
  },
  'brawl-stars': {
    minimum: 8,
    step: 1,
    name: 'Grupos + eliminatorias',
    kind: 'brawl',
    capacity: 16,
    note: 'Grupos de hasta cuatro; pasan dos por grupo. Cuartos y semifinales BO3; final BO5 y tercer puesto BO3. Con 16 plazas se conserva el cruce de semifinales indicado en las normas.',
    source: 'Reglamento Brawl Stars · ULP 2026',
  },
  'clash-royale': {
    minimum: 8,
    step: 1,
    name: 'Suizo + Top 4',
    kind: 'clash',
    capacity: 32,
    note: 'Cinco rondas suizas BO1. Los cuatro mejores disputan semifinales (1.º–4.º y 2.º–3.º) y final BO5.',
    source: 'Reglamento Clash Royale · ULP 2026',
  },
  futbolin: {
    minimum: 4,
    step: 1,
    name: 'Partidas por parejas',
    kind: 'unknown',
    capacity: 16,
    note: 'Partidas a nueve bolas. El documento no fija cómo se organiza el cuadro: los cruces y su estructura quedan por confirmar.',
    source: 'Reglamento Futbolín · ULP 2026',
  },
  'ping-pong': {
    minimum: 12,
    step: 1,
    name: 'Grupos + eliminatorias',
    kind: 'ping',
    capacity: 24,
    note: 'Grupos de hasta tres jugadores, una vuelta. Pasa el primero; cuartos y semifinales BO3 y final BO5. El orden de los cruces no está publicado.',
    source: 'Formato Ping Pong · ULP 2026 (documento de organización)',
  },
  '2XKO': {
    minimum: 4,
    step: 1,
    name: 'Beat the Pro',
    kind: 'pro',
    capacity: 16,
    note: 'Retador contra organización, 1v1 o 1v2. Un punto por set ganado; gana la puntuación acumulada más alta.',
    source: 'Reglamento 2XKO · ULP 2026',
  },
  'beat-saber': {
    minimum: 4,
    step: 1,
    name: 'Récord de puntuación',
    kind: 'score',
    capacity: 16,
    note: 'Mejor puntuación en el mapa y dificultad anunciados durante el evento. Mapa y dificultad: TBD.',
    source: 'Reglamento Beat Saber · ULP 2026',
  },
  cars: {
    minimum: 4,
    step: 1,
    name: 'Contrarreloj',
    kind: 'time',
    capacity: 16,
    note: 'Intentos individuales con volante; gana el mejor tiempo. Circuito y ajustes se anuncian en el evento: TBD.',
    source: 'Reglamento Cars · ULP 2026',
  },
  tetris: {
    minimum: 4,
    step: 1,
    name: 'Blitz · dos minutos',
    kind: 'score',
    capacity: 16,
    note: 'TETR.IO Blitz, intentos de dos minutos. Se conserva la mejor puntuación de cada participante.',
    source: 'Documento Tetris · Retos ULP 2026',
  },
  'street-fighter': {
    minimum: 8,
    step: 1,
    name: 'Rey de la pista + mini-torneo opcional',
    kind: 'street',
    capacity: 8,
    note: 'Un punto por victoria en rey de la pista. Con ocho o más participantes puede organizarse un mini-torneo: BO3 y final BO5. La simulación lo muestra como opción, no como resultado confirmado.',
    source: 'Documento Street Fighter II · Retos ULP 2026',
  },
  hacking: {
    minimum: 4,
    step: 1,
    name: 'Capture the Flag',
    kind: 'score',
    capacity: 24,
    note: 'Participación individual o en equipos de hasta tres. Clasificación por puntos de los retos resueltos; las pistas restan puntuación. Desempate por el envío más temprano de la última flag válida.',
    source: 'Reglamento CTF · ULP 2026',
  },
  f1: {
    minimum: 4,
    step: 1,
    name: 'Formato pendiente',
    kind: 'pending',
    capacity: 16,
    note: 'No se ha localizado un reglamento específico de 2026. Modalidad, circuito y criterio de clasificación pendientes; no se trasladan reglas de otras ediciones.',
    source: 'Pendiente de documento de organización',
  },
  retro: {
    minimum: 4,
    step: 1,
    name: 'Formato pendiente',
    kind: 'pending',
    capacity: 16,
    note: 'No se ha localizado un reglamento específico de 2026. Juego, formato y criterio de clasificación pendientes.',
    source: 'Pendiente de documento de organización',
  },
};
export function getTournamentFormat(id) {
  return typeof id === 'string' && Object.hasOwn(tournamentFormats, id)
    ? tournamentFormats[id]
    : undefined;
}
export const capacityOptions = Array.from(
  { length: 63 },
  (_, index) => index + 2,
);
export function getCapacityOptions(id) {
  const config = getTournamentFormat(id);
  return config
    ? capacityOptions.filter(
        (n) => n >= config.minimum && (n - config.minimum) % config.step === 0,
      )
    : [];
}
const power = (n) => 2 ** Math.ceil(Math.log2(Math.max(2, n)));
const match = (id, labels = ['Plaza por asignar', 'Plaza por asignar']) => ({
  id,
  players: ['TBD', 'TBD'],
  labels,
  scores: [null, null],
  nextId: null,
  bye: false,
});
const letter = (i) => String.fromCharCode(65 + i);
function elimination(
  n,
  prefix,
  bestOf = 'BO3',
  finalBest = bestOf,
  sources = [],
) {
  const size = power(n),
    rounds = [];
  let seeds = [1, 2];
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1;
    seeds = seeds.flatMap((seed) => [seed, sum - seed]);
  }
  for (let count = size / 2, r = 0; count >= 1; count /= 2, r++) {
    const name =
      count === 1
        ? 'Final'
        : count === 2
          ? 'Semifinales'
          : count === 4
            ? 'Cuartos de final'
            : `Ronda de ${count * 2}`;
    const matches = Array.from({ length: count }, (_, i) => {
      const item = match(
        `${prefix}-${r}-${i}`,
        r === 0
          ? [0, 1].map(
              (j) =>
                sources[seeds[i * 2 + j] - 1] ??
                (seeds[i * 2 + j] > n ? 'Pase directo' : 'Plaza por asignar'),
            )
          : [`Gana cruce ${i * 2 + 1}`, `Gana cruce ${i * 2 + 2}`],
      );
      item.bye =
        r === 0 && seeds.slice(i * 2, i * 2 + 2).some((seed) => seed > n);
      item.nextId =
        count > 1 ? `${prefix}-${r + 1}-${Math.floor(i / 2)}` : null;
      return item;
    });
    rounds.push({ name, detail: count === 1 ? finalBest : bestOf, matches });
  }
  return {
    kind: 'bracket',
    title: 'Fase eliminatoria',
    rounds,
    detail: `${n} plazas · ${size - n} pases directos`,
  };
}
function groups(n, groupSize, qualify, bestOf = 'BO1') {
  const count = Math.ceil(n / groupSize),
    base = Math.floor(n / count),
    extra = n % count;
  return {
    kind: 'groups',
    title: 'Fase de grupos',
    detail: `${count} grupos · ${bestOf} · pasan ${qualify} por grupo`,
    groups: Array.from({ length: count }, (_, i) => {
      const size = base + (i < extra ? 1 : 0),
        seats = Array.from({ length: size }, (_, j) => j + 1),
        schedule = seats.length % 2 ? [...seats, null] : seats.slice(),
        rounds = [];
      for (let r = 0; r < schedule.length - 1; r++) {
        const matches = [];
        for (let j = 0; j < schedule.length / 2; j++) {
          const a = schedule[j],
            b = schedule.at(-1 - j);
          if (a && b)
            matches.push(
              match(`g${i}-${r}-${j}`, [`Plaza ${a}`, `Plaza ${b}`]),
            );
        }
        rounds.push({ name: `Jornada ${r + 1}`, matches });
        schedule.splice(1, 0, schedule.pop());
      }
      return {
        name: `Grupo ${letter(i)}`,
        size,
        qualify: Math.min(qualify, size),
        rounds,
      };
    }),
  };
}
function swiss(n, rounds, title = 'Fase suiza', detail = 'BO1') {
  return {
    kind: 'swiss',
    title,
    detail,
    rounds: Array.from({ length: rounds }, (_, r) => ({
      name: `Ronda ${r + 1}`,
      detail:
        n % 2
          ? 'Un pase libre por ronda, por asignar'
          : 'Según resultados de la ronda anterior',
      matches: Array.from({ length: Math.floor(n / 2) }, (_, i) =>
        match(`swiss-${r}-${i}`),
      ),
    })),
  };
}
const ranking = (n, title, metric = 'Puntuación') => ({
  kind: 'ranking',
  title,
  detail: metric,
  rows: Array.from({ length: n }, (_, i) => ({
    position: i + 1,
    name: 'TBD',
    value: 'TBD',
  })),
});
export function buildTournamentFormat(id, capacity) {
  const config = getTournamentFormat(id);
  if (
    !config ||
    !Number.isInteger(capacity) ||
    capacity < config.minimum ||
    capacity > 64 ||
    (capacity - config.minimum) % config.step !== 0
  )
    return null;
  const n = capacity,
    phases = [],
    kind = config.kind;
  if (['lol', 'rocket', 'brawl', 'ping'].includes(kind)) {
    const qualifier = kind === 'lol' || kind === 'ping' ? 1 : 2,
      g = groups(
        n,
        kind === 'lol' || kind === 'brawl' ? 4 : kind === 'rocket' ? 5 : 3,
        qualifier,
        kind === 'rocket' ? 'BO3' : 'BO1',
      );
    phases.push(g);
    let finalists = g.groups.reduce((sum, item) => sum + item.qualify, 0),
      sources = g.groups.flatMap((item) =>
        Array.from(
          { length: item.qualify },
          (_, i) => `${i + 1}.º ${item.name}`,
        ),
      );
    if (kind === 'lol' && g.groups.length > 1) {
      const missing = power(g.groups.length) - g.groups.length;
      if (missing) {
        const repechage = groups(g.groups.length, g.groups.length, missing);
        repechage.title = 'Repesca entre segundos';
        repechage.detail = `Una vuelta · BO1 · ${missing} plaza${missing > 1 ? 's' : ''} a la fase final`;
        phases.push(repechage);
        sources.push(
          ...Array.from({ length: missing }, (_, i) => `${i + 1}.º repesca`),
        );
        finalists += missing;
      }
    }
    if (finalists > 1) {
      if (kind === 'brawl' && g.groups.length === 4) {
        sources = [
          '1.º Grupo A',
          '2.º Grupo B',
          '2.º Grupo A',
          '1.º Grupo B',
          '1.º Grupo C',
          '2.º Grupo D',
          '2.º Grupo C',
          '1.º Grupo D',
        ];
      }
      const bracket = elimination(
        finalists,
        'playoff',
        kind === 'lol' ? 'BO1' : kind === 'rocket' ? 'BO5' : 'BO3',
        kind === 'lol' ? 'BO1' : 'BO5',
        kind === 'rocket' || kind === 'ping' || kind === 'lol' ? [] : sources,
      );
      bracket.detail +=
        kind === 'rocket'
          ? ' · Orden por diferencia de partidos y sorteo'
          : kind === 'lol'
            ? ' · Sorteo de semifinales'
            : kind === 'ping'
              ? ' · Sorteo por confirmar'
              : '';
      if (kind === 'brawl' && bracket.rounds[0].matches.length === 4) {
        bracket.rounds[0].matches.forEach((item, i) => {
          item.nextId = `playoff-1-${[0, 1, 1, 0][i]}`;
          item.labels = [
            ['1.º Grupo A', '2.º Grupo B'],
            ['2.º Grupo A', '1.º Grupo B'],
            ['1.º Grupo C', '2.º Grupo D'],
            ['2.º Grupo C', '1.º Grupo D'],
          ][i];
        });
        bracket.rounds[1].matches[0].labels = [
          'Gana cuartos 1',
          'Gana cuartos 4',
        ];
        bracket.rounds[1].matches[1].labels = [
          'Gana cuartos 2',
          'Gana cuartos 3',
        ];
      }
      phases.push(bracket);
      if (kind === 'brawl' && finalists >= 4)
        phases.push({
          kind: 'bracket',
          title: 'Tercer puesto',
          detail: 'BO3 · Pierden las semifinales',
          rounds: [
            {
              name: 'Tercer puesto',
              detail: 'BO3',
              matches: [
                match('third', ['Pierde semifinal 1', 'Pierde semifinal 2']),
              ],
            },
          ],
        });
    }
  } else if (kind === 'swiss' || kind === 'clash') {
    phases.push(
      swiss(
        n,
        kind === 'clash' ? 5 : Math.ceil(Math.log2(n)),
        kind === 'clash'
          ? 'Cinco rondas suizas'
          : 'Rondas suizas · propuesta según plazas',
      ),
    );
    if (kind === 'clash')
      phases.push(
        elimination(Math.min(4, n), 'top4', 'BO5', 'BO5', [
          '1.º suizo',
          '2.º suizo',
          '3.º suizo',
          '4.º suizo',
        ]),
      );
  } else if (kind === 'tennis') {
    for (let i = 0; i < Math.min(3, n); i++)
      phases.push(
        swiss(
          Math.floor(n / Math.min(3, n)) + (i < n % Math.min(3, n) ? 1 : 0),
          3,
          `Grupo suizo ${letter(i)}`,
        ),
      );
    phases.push({
      kind: 'bracket',
      title: 'Repesca y fase final',
      detail:
        'Con 0 o 1 victoria: repesca. Tamaño y cruces tras las tres rondas.',
      rounds: [
        { name: 'Repesca · cruces pendientes', matches: [match('repesca')] },
        {
          name: 'Fase final · plazas pendientes',
          matches: [match('tennis-final')],
        },
      ],
    });
  } else if (kind === 'double') {
    const winners = elimination(n, 'winners', 'BO5');
    winners.title = 'Cuadro de ganadores';
    phases.push(winners);
    const count = Math.log2(power(n)) * 2 - 2,
      rounds = Array.from({ length: count }, (_, r) => ({
        name: `Repesca ${r + 1}`,
        detail: 'BO5',
        matches: Array.from(
          { length: Math.max(1, power(n) / 2 ** (Math.floor(r / 2) + 2)) },
          (_, i) => match(`losers-${r}-${i}`),
        ),
      }));
    rounds.forEach((round, r) =>
      round.matches.forEach((item, i) => {
        item.labels = [
          'Procedencia por confirmar',
          'Procedencia por confirmar',
        ];
        item.nextId =
          r < count - 1
            ? rounds[r + 1].matches[
                Math.min(
                  rounds[r + 1].matches.length - 1,
                  Math.floor(
                    (i * rounds[r + 1].matches.length) / round.matches.length,
                  ),
                )
              ].id
            : null;
      }),
    );
    if (rounds.length)
      phases.push({
        kind: 'bracket',
        title: 'Cuadro de repesca',
        detail:
          'Segunda derrota elimina · los pases directos no cuentan como derrota',
        rounds,
      });
    phases.push({
      kind: 'bracket',
      title: 'Gran final',
      detail: 'BO5 · Reinicio condicionado a la victoria de repesca',
      rounds: [
        {
          name: 'Gran final',
          detail: 'BO5',
          matches: [
            match('grand-final', ['Gana cuadro principal', 'Gana repesca']),
          ],
        },
        {
          name: 'Reinicio · si procede',
          detail: 'BO5',
          matches: [match('reset')],
        },
      ],
    });
  } else if (kind === 'race') {
    let pilots = n,
      round = 0;
    while (pilots > 4) {
      const sizes = Array.from({ length: Math.ceil(pilots / 4) }, (_, i) =>
        Math.min(4, pilots - i * 4),
      );
      phases.push({
        kind: 'race',
        title: round === 0 ? 'Supervivencia' : `Grand Prix · ronda ${round}`,
        detail:
          round === 0
            ? 'Pasan dos por serie'
            : 'Cuatro carreras · pasan dos por serie',
        groups: sizes.map((size, i) => ({
          name: `Serie ${i + 1}`,
          size,
          qualify: Math.min(2, size),
        })),
      });
      pilots = sizes.reduce((sum, size) => sum + Math.min(2, size), 0);
      round++;
    }
    phases.push({
      kind: 'race',
      title: 'Grand Prix · final',
      detail: 'Cuatro carreras',
      groups: [{ name: 'Final', size: pilots, qualify: 1 }],
    });
  } else if (kind === 'survival') {
    phases.push({
      kind: 'race',
      title: 'UHC · parejas',
      detail:
        n % 2
          ? 'Última pareja pendiente de completar'
          : 'Tres puntos por baja + puntos de posición',
      groups: Array.from({ length: Math.ceil(n / 2) }, (_, i) => ({
        name: `Pareja ${i + 1}`,
        size: Math.min(2, n - i * 2),
        qualify: 0,
      })),
    });
    for (let i = 1; i <= 5; i++)
      phases.push(
        ranking(
          n,
          `Hunger Games · partida ${i}`,
          'Dos puntos por baja + puntos de posición',
        ),
      );
  } else if (kind === 'bowling') {
    phases.push(
      ranking(n, 'Clasificación inicial', 'Seis lanzamientos'),
      ranking(Math.min(16, n), 'Segunda fase', 'Seis lanzamientos'),
      ranking(Math.min(8, n), 'Final', 'Diez lanzamientos'),
    );
  } else if (kind === 'unknown') {
    phases.push({
      kind: 'bracket',
      title: 'Cruces por definir',
      detail: 'A nueve bolas · estructura del torneo por confirmar',
      rounds: [
        {
          name: 'Partidas · sin sorteo confirmado',
          matches: Array.from({ length: Math.floor(n / 2) }, (_, i) =>
            match(`pending-${i}`),
          ),
        },
      ],
    });
  } else if (kind === 'pro') {
    phases.push(
      {
        kind: 'bracket',
        title: 'Beat the Pro',
        detail: '1v1 o 1v2 · un punto por set ganado',
        rounds: [
          {
            name: 'Reto al organizador',
            matches: [match('beat-pro', ['Organización', 'Retador'])],
          },
        ],
      },
      ranking(n, 'Clasificación del reto', 'Sets ganados'),
    );
  } else {
    phases.push(
      ranking(
        n,
        kind === 'pending'
          ? 'Clasificación pendiente'
          : kind === 'street'
            ? 'Rey de la pista'
            : 'Clasificación',
        kind === 'time'
          ? 'Mejor tiempo'
          : kind === 'pending'
            ? 'Criterio pendiente'
            : 'Mejor puntuación',
      ),
    );
    if (kind === 'street' && n >= 8) {
      const bracket = elimination(n, 'optional', 'BO3', 'BO5');
      bracket.title = 'Mini-torneo opcional';
      bracket.detail += ' · Aplicación sujeta a organización';
      phases.push(bracket);
    }
  }
  return { id, capacity: n, config, phases };
}
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );
function matchHTML(item, index) {
  return `<article class="format-match tournament-match${item.bye ? ' is-bye' : ''}" data-format-match="${esc(item.id)}" ${item.nextId ? `data-format-next="${esc(item.nextId)}"` : ''}>
    <header class="tournament-match-meta"><span>Encuentro ${String(index + 1).padStart(2, '0')}</span><span>${item.bye ? 'Pase directo' : 'Por asignar'}</span></header>
    ${item.players.map((player, i) => `<div class="tournament-team"><span class="tournament-team-badge" aria-hidden="true">?</span><span class="tournament-team-name"><b>${esc(player)}</b><small>${esc(item.labels[i])}</small></span><span class="format-score tournament-score" aria-label="Marcador pendiente">—</span></div>`).join('')}
    ${item.bye ? '<p class="tournament-bye">Pase directo · rival pendiente de asignación</p>' : ''}
  </article>`;
}
function roundHeading(round, index) {
  return `<h5 class="tournament-round-heading${round.name === 'Final' ? ' is-final' : ''}"><span class="tournament-round-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${esc(round.name)}<small>${round.matches.length} ${round.matches.length === 1 ? 'cruce' : 'cruces'}${round.detail ? ` · ${esc(round.detail)}` : ''}</small></span></h5>`;
}
export function renderTournamentFormat(model) {
  if (!model) return '';
  return `<div class="format-meta"><span>${esc(model.capacity)} plazas</span><span>Simulación del formato</span><span>Sin sorteo ni resultados</span></div>${model.phases.map((phase, index) => `<section class="format-phase" data-format-kind="${esc(phase.kind)}"><header><span class="format-phase-number">${String(index + 1).padStart(2, '0')}</span><div><h4>${esc(phase.title)}</h4><p>${esc(phase.detail ?? '')}</p></div></header>${phase.kind === 'bracket' ? `<div class="format-scroll" tabindex="0" role="region" aria-label="${esc(phase.title)}"><div class="format-bracket" style="--format-rounds:${phase.rounds.length}"><svg data-format-lines aria-hidden="true"></svg>${phase.rounds.map((round, roundIndex) => `<section class="format-round">${roundHeading(round, roundIndex)}<div>${round.matches.map(matchHTML).join('')}</div></section>`).join('')}</div></div>` : phase.kind === 'swiss' ? `<div class="format-pools format-swiss">${phase.rounds.map((round) => `<details class="format-pool"><summary>${esc(round.name)}<span>${round.matches.length} cruces</span></summary><p>${esc(round.detail)}</p><div>${round.matches.map(matchHTML).join('')}</div></details>`).join('')}</div>` : phase.kind === 'groups' ? `<div class="format-pools">${phase.groups.map((group) => `<details class="format-pool"><summary>${esc(group.name)}<span>${group.size} plazas</span></summary><ol class="format-seats">${Array.from({ length: group.size }, (_, i) => `<li><span>${i + 1}</span><b>TBD</b><small>${i < group.qualify ? 'Clasifica' : '—'}</small></li>`).join('')}</ol>${group.rounds.map((round) => `<h5>${esc(round.name)}</h5>${round.matches.map(matchHTML).join('')}`).join('')}</details>`).join('')}</div>` : phase.kind === 'race' ? `<div class="format-pools">${phase.groups.map((group) => `<article class="format-pool"><h5>${esc(group.name)}</h5><ol class="format-seats">${Array.from({ length: group.size }, (_, i) => `<li><span>${i + 1}</span><b>TBD</b><small>${group.qualify && i < group.qualify ? 'Clasifica' : '—'}</small></li>`).join('')}</ol></article>`).join('')}</div>` : `<details class="format-ranking"><summary>Ver ${phase.rows.length} plazas <span>Resultados TBD</span></summary><ol class="format-seats">${phase.rows.map((row) => `<li><span>${row.position}</span><b>${esc(row.name)}</b><small>${esc(row.value)}</small></li>`).join('')}</ol></details>`}</section>`).join('')}`;
}
