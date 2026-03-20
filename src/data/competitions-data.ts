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

export const Competitions: CompetitionData[] = [
  {
    id: 'ajedrez',
    name: 'Ajedrez',
    rules:
      'https://drive.google.com/file/d/17o4kUmzgLb0nZHfv500aAdQbF3zxf2kh/view?usp=drive_link',
    registration: 'https://forms.gle/hRk68DAWJcEAStmf7',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: '10:00 - 14:00', round: 'Torneo Ajedrez' }],
    place: 'Sala de Estudiantes.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/ajedrez.webp',
    trophy: '/assets/models/ajedrez.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x2 Bonos Karting - Formula Karting Granada',
        'x2 Viajes organizados Emycet',
        'x1 Tarjeta Amazon 25€',
      ],
      second: ['Trofeo ULP', 'x1 Mando MGPXPRO Mars Gaming'],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    rules:
      'https://drive.google.com/file/d/1kwPUjbZoteRiS6tscZkMRUrFqA_N3nfu/view?usp=sharing',
    registration: 'https://forms.gle/X8fPY1enBJoHs7xD9',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: '14:30 - 16:30', round: 'Torneo Minecraft' }],
    place: 'Prefabricada B1.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/minecraft.webp',
    trophy: '/assets/models/mc.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x1 Jersey Gen.G eSports',
        'x1 Keycap Gen.G Esports',
      ],
      second: [
        'Trofeo ULP',
        'x1 Mando MGPXPRO Mars Gaming',
        'x1 Keycap Gen.G Esports',
      ],
      third: ['Trofeo ULP', 'x1 Keycap Gen.G Esports'],
    },
  },
  {
    id: 'mario-kart',
    name: 'Mario Kart World',
    rules:
      'https://drive.google.com/file/d/1_7tfC7cQTy7xc0yLtPpA56DRQd2cPMnM/view?usp=drive_link',
    registration: 'https://forms.gle/v1iYnEvuJYjfChjC7',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '16:30 - 20:00', round: 'Eliminatoria' },
      { time: '20:00 - 21:00', round: 'Fase Final' },
    ],
    place: 'Prefabricada A1.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/mario-kart.webp',
    trophy: '/assets/models/mario-kart.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x1 Juego Gear Club 3 Unlimited (Nintendo Switch 2)',
        'x1 Mando MGPXPRO Mars Gaming',
        'x2 Bonos Fórmula Karting',
      ],
      second: ['Trofeo ULP', 'x2 Bonos Fórmula Karting'],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    rules:
      'https://drive.google.com/file/d/16KEdp-ZYeGH3zD9nXfaQkkTGFz6GZVVn/view?usp=drive_link',
    registration: 'https://forms.gle/irjKuCsbp1pRMDh69',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 14:00', round: 'Fase de Grupos' },
      { time: '17:30 - 18:30', round: 'Semifinal I' },
      { time: '18:30 - 19:30', round: 'Semifinal II' },
      { time: '20:00 - 21:00', round: 'Final' },
    ],
    place: 'Prefabricadas A2 y B1.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/lol.webp',
    trophy: '/assets/models/lol.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x5 Tarjetas Amazon 25€',
        'x5 Keycaps Gen.G Esports',
        'x5 Badges Gen.G Esports',
        'x5 Suscripciones Your.GG',
      ],
      second: [
        'Trofeo y Medalla ULP',
        'x5 Tarjetas Amazon 25€',
        'x5 Badges Gen.G Esports',
      ],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['x1 Jersey Gen.G Esports'],
    },
  },
  /* {
    id: 'valorant',
    name: 'Valorant',
    rules:
      'https://drive.google.com/file/d/1kbVNC0yWN-2Awg0QtkNnTuvaW_gWQv_w/view?usp=drive_link',
    registration: 'https://forms.gle/LD8GxbuYMgMUxuxj8',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 15:30', round: 'Fase de Grupos' },
      { time: '17:00 - 18:00', round: 'Semifinal I' },
      { time: '18:00 - 19:00', round: 'Semifinal II' },
      { time: '19:00 - 20:00', round: 'Final' },
    ],
    place: 'Prefabricada A2.',
    tags: ['PC', 'Competición'],
    backgroundImage: '/assets/competitions/backgrounds/valorant.webp',
    trophy: '/assets/models/valorant.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x5 Tarjetas Amazon 50€',
        'x5 Bonos Scape Room',
      ],
      second: ['Trofeo y Medalla ULP', 'x5 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['x1 Tarjeta Amazon 25€ y x1 Bono Scape Room'],
    },
  }, */
  {
    id: 'rocket-league',
    name: 'Rocket League',
    rules:
      'https://drive.google.com/file/d/1rOl9qPPdKn_TkVImEuAYJtxU1hMTq8yx/view?usp=drive_link',
    registration: 'https://forms.gle/wEgWNqQRuq1ocoPp9',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '15:30 - 18:00', round: 'Fase de Grupos' },
      { time: '18:00 - 19:00', round: 'Final' },
    ],
    place: 'Prefabricada A2.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/rocket-league.webp',
    trophy: '/assets/models/rocket.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x2 Juegos STYX: Blades of Greed (PlayStation 5)',
        'x2 Keycaps Gen.G Esports',
      ],
      second: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'wii-sports-tenis',
    name: 'Wii Sports Tenis',
    rules:
      'https://drive.google.com/file/d/19lw2h7hCXiEpLwFO-bEwGF41YIl-IF1V/view?usp=drive_link',
    registration: 'https://forms.gle/HsQDEKmqzy92Ges47',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '16:00 - 19:00', round: 'Fase de Grupos' },
      { time: '19:00 - 20:00', round: 'Final' },
    ],
    place: 'Aulas -1.1 y -1.2.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/wii-tenis.webp',
    trophy: '/assets/models/wii.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Mando Revolution X Unlimited (PC) ~ 200€'],
      second: ['Trofeo ULP', 'x1 Mando MGPXPRO Mars Gaming'],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'wii-sports-bolos',
    name: 'Wii Sports Bolos',
    rules:
      'https://drive.google.com/file/d/1emhSanMB98aI7M_aDgYjxzFL5x-ibYX4/view?usp=drive_link',
    registration: 'https://forms.gle/LmPpLQZMJSqLuzbw8',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 13:00', round: 'Fase de Grupos' },
      { time: '13:00 - 14:00', round: 'Final' },
    ],
    place: 'Aulas -1.1 y -1.2.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/wii-bolos.webp',
    trophy: '/assets/models/wii.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x1 Microfono M100 HS Nacon ~100€',
        'x1 Mando MGPXPRO Mars Gaming',
      ],
      second: [
        'Trofeo ULP',
        'x1 Mando MM-XT Mars Gaming',
        'x1 Tarjeta Amazon 25€',
      ],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'smash',
    name: 'Super Smash Bros Ultimate',
    rules:
      'https://drive.google.com/file/d/1XCmukFJFxexuuAR9G0zOYl319Eg6nnAI/view?usp=drive_link',
    registration: 'https://forms.gle/psgLvwYrHsULbfDC7',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 19:00', round: 'Fase de Grupos' },
      { time: '19:00 - 20:00', round: 'Final' },
    ],
    place: 'Aula -1.2.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/smash.webp',
    trophy: '/assets/models/smash.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x1 Juego Gear Club 3 Unlimited (Nintendo Switch 2)',
        'x1 Mando MM-XT Mars Gaming',
        'x1 Bonos Fórmula Karting',
      ],
      second: ['Trofeo ULP', 'x1 Mando MGPXPRO Mars Gaming'],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    rules:
      'https://drive.google.com/file/d/1Ea65hDtIyDuSvI1cyqJu1zMD5QSuLUNg/view?usp=drive_link',
    registration: 'https://forms.gle/TguVfCWCfjrMi92g6',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 14:00', round: 'Fase de Grupos' },
      { time: '15:30 - 16:30', round: 'Final' },
    ],
    place: 'Prefabricada A1.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/brawl-stars.webp',
    trophy: '/assets/models/brawl-stars.obj',
    awards: {
      first: ['Copa ULP', 'x6 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x3 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    rules:
      'https://drive.google.com/file/d/1fghtfNXF_PYzgNTnu8RmQOZdJKI_oIvZ/view?usp=drive_link',
    registration: 'https://forms.gle/J2o7v6bkZj51pXiBA',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 14:00', round: 'Fase de Grupos' },
      { time: '15:30 - 16:30', round: 'Final' },
    ],
    place: 'Prefabricadas A1 y A2.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/clash-royale.webp',
    trophy: '/assets/models/clash-royale.obj',
    awards: {
      first: ['Trofeo', 'x1 Microfono M100 HS Nacon'],
      second: ['Trofeo', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo'],
    },
  },
  {
    id: '2XKO',
    name: '2XKO',
    rules:
      'https://drive.google.com/file/d/1BMqIb4iaA_J6lE0TXf_cLCXfJpnlTxdT/view?usp=sharing',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Hall Edificio Principal.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/2xko.webp',
    trophy: '/assets/models/2XKO.obj',
    awards: {
      first: [
        'Trofeo ULP',
        'x1 Jersey Gen.G eSports',
        'x1 Suscripción Your.GG',
      ],
      second: ['x1 Suscripción Your.GG'],
      third: [],
    },
  },
  {
    id: 'f1',
    name: 'F1',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Hall Edificio Principal.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/f1.webp',
    trophy: '/assets/models/f1.obj',
    awards: {
      first: ['Trofeo ULP', 'Juego Gear Club 3 Unlimited (Nintendo Switch 2)'],
      second: ['x2 Bonos Fórmula Karting'],
      third: [],
    },
  },
  {
    id: 'futbolin',
    name: 'Futbolín',
    rules:
      'https://drive.google.com/file/d/1EDfhmMzzISQqQrboPw2ijqSF3tsrNVQt/view?usp=drive_link',
    registration: 'https://forms.gle/rWzswNKrAYvpgLRW6',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '10:00 - 14:00', round: 'Fase de Grupos' },
      { time: '15:00 - 16:30', round: 'Fase de Grupos' },
      { time: '16:30 - 18:00', round: 'Final' },
    ],
    place: 'Entrada patio.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/futbolin.webp',
    trophy: '/assets/models/futbolin.obj',
    awards: {
      first: ['Trofeo ULP', 'x2 Auriculares RIG 600 ACID HS Nacon'],
      second: ['Trofeo ULP', 'x2 Mandos MM-XT Mars Gaming'],
      third: ['Trofeo ULP'],
    },
  },
  {
    id: 'ping-pong',
    name: 'Ping Pong',
    rules:
      'https://drive.google.com/file/d/1pgBs7yoMWEMQJNA4kMdEsWyWf1KNwxOP/view?usp=drive_link',
    registration: 'https://forms.gle/hxri8zkoXdnoogD69',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: '10:00 - 14:00', round: 'Eliminatoria.' }],
    place: 'Bajo de cafetería.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/ping-pong.webp',
    trophy: '/assets/models/ping-pong.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Mando Revolution X Unlimited (PC) ~ 200€'],
      second: ['Trofeo ULP', 'x1 Mando MGPXPRO Mars Gaming'],
      third: ['Trofeo ULP', 'x1 Mando MM-XT Mars Gaming'],
    },
  },
  {
    id: 'retro',
    name: 'Juego Retro',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Aula -1.1.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/retro.webp',
    trophy: '/assets/models/SONIC.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Tarjeta Amazon 25€'],
      second: [],
      third: [],
    },
  },
  {
    id: 'street-fighter',
    name: 'Street Fighter II',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Aula -1.1.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/street-fighter.webp',
    trophy: '/assets/models/street-fighter.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Juego: John Mambo Ed. Coleccionista'],
      second: [],
      third: [],
    },
  },
  {
    id: 'beat-saber',
    name: 'Beat Saber',
    rules:
      'https://drive.google.com/file/d/1tbSdcSUhcJfHx5CHd2GCIMpFoV8RnaqU/view?usp=sharing',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Hall Edificio Principal.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/beat-saber.webp',
    trophy: '/assets/models/beat-saber.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Viaje Organizado Emycet'],
      second: ['x1 Bono Karting - Formula Karting Granada'],
      third: [],
    },
  },
  {
    id: 'hacking',
    name: 'Hacking Ético',
    rules:
      'https://drive.google.com/file/d/15_tPVyadkHryQsnfRhB-EPS4vA9KYybO/view?usp=drive_link',
    registration: 'https://forms.gle/PsfNEL5DswXSp4dH8',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Sala de Profesores Externos.',
    tag: 'competicion',
    backgroundImage: '/assets/competitions/backgrounds/hacking.webp',
    trophy: '/assets/models/ctf.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Flipper Zero Starter Full Set'],
      second: ['x1 Raspberry Pi 5 4GB Starter Kit'],
      third: ['x1 Proxmark3 512M', 'x1 Kit de Soldadura'],
    },
  },
  {
    id: 'tetris',
    name: 'Tetris',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Aula -1.1.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/tetris.webp',
    trophy: '/assets/models/tetris.obj',
    awards: {
      first: ['Trofeo ULP', 'x1 Clave Juego The Game Kitchen'],
      second: [],
      third: [],
    },
  },
  {
    id: 'cars',
    name: 'CARS',
    rules:
      'https://drive.google.com/file/d/1IfoHrrR0FGOcC39AEaV_NWQU4qxXRhm3/view?usp=sharing',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: 'Mejor puntuación' }],
    place: 'Hall Edificio Principal.',
    tag: 'reto',
    backgroundImage: '/assets/competitions/backgrounds/cars.webp',
    trophy: '/assets/models/cars.obj',
    awards: {
      first: ['Copa Pistón ULP', 'x1 Clave Juego The Game Kitchen'],
      second: [],
      third: [],
    },
  },
  {
    id: 'street-pass',
    name: 'Street Pass',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: '' }],
    place: 'Cafetería ETSIIT.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Pasa por el stand de StreetPass Málaga y comparte tu Mii con otros asistentes para ganar premios y sorpresas. Habrá torneos con juegos de la 3DS. Consulta el cartel en las redes sociales para más información.',
  },
  {
    id: 'watch-party',
    name: 'Watch Party',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: '' }],
    place: 'Salón de Grados.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Visualiza en directo las competiciones más emocionantes del evento en nuestras pantallas gigantes. No te pierdas ni un solo momento de la acción y anima a tus competidores favoritos.',
  },
  {
    id: 'tcg',
    name: 'Pokemon TCG',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: '' }],
    place: 'Hall Edificio Principal.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Stand con cartas de Pokemon TCG. Explora las colecciones y obten tu carta favorita.',
  },
  {
    id: 'indie-fest',
    name: 'Indie Fest',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: '' }],
    place: 'Hall Edificio Principal.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Festival de juegos independientes. Descubre nuevos títulos y comparte tu opinión con los desarrolladores.',
  },
  {
    id: 'juego-libre',
    name: 'Juego Libre',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [{ time: 'Todo el día', round: '' }],
    place: 'Entrada Edificio Principal.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'Explora las diferentes consolas y juegos disponibles en el área de juego libre. Desde consolas clásicas hasta las últimas novedades, hay algo para todos los gustos. ¡Ven a jugar y descubrir nuevos títulos!',
  },
  {
    id: 'paella',
    name: 'Paella',
    rules: '',
    registration: '',
    registrationPeriodOpen: false,
    participants: '',
    schedule: [
      { time: '13:30', round: '1º Tanda' },
      { time: '14:15', round: '2º Tanda' },
    ],
    place: 'Cafetería ETSIIT.',
    tag: 'actividad',
    backgroundImage: '',
    trophy: '',
    description:
      'No te pierdas la tradicional paella del evento, preparada por el equipo de cocina de la cafetería. Disfruta de un delicioso plato mientras compartes momentos con otros asistentes.',
  },
];

export const CompetitionsCards: CompetitionCardData[] = [
  {
    id: 'wii-sports-tenis',
    card: '/assets/competitions/cards/wii-tenis.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-tenis.webp',
    type: 'competicion',
  },
  {
    id: 'wii-sports-bolos',
    card: '/assets/competitions/cards/wii-bolos.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-bolos.webp',
    type: 'competicion',
  },
  {
    id: 'mario-kart',
    card: '/assets/competitions/cards/mario-kart.webp',
    logo: '/assets/competitions/logos/mario-kart.webp',
    character: '/assets/competitions/characters/character-mario.webp',
    type: 'competicion',
  },
  /* {
    id: 'valorant',
    card: '/assets/competitions/cards/valorant.webp',
    logo: '/assets/competitions/logos/valorant.webp',
    character: '/assets/competitions/characters/valorant.webp',
  }, */
  {
    id: 'league-of-legends',
    card: '/assets/competitions/cards/lol.webp',
    logo: '/assets/competitions/logos/lol.webp',
    character: '/assets/competitions/characters/character-lol.webp',
    type: 'competicion',
  },

  {
    id: 'rocket-league',
    card: '/assets/competitions/cards/rocket.webp',
    logo: '/assets/competitions/logos/rocket.webp',
    character: '/assets/competitions/characters/character-rocket.webp',
    type: 'competicion',
  },
  {
    id: 'brawl-stars',
    card: '/assets/competitions/cards/brawls-stars.webp',
    logo: '/assets/competitions/logos/brawl-stars.webp',
    character: '/assets/competitions/characters/character-brawl-stars.webp',
    type: 'competicion',
  },
  {
    id: 'clash-royale',
    card: '/assets/competitions/cards/clash-royale.webp',
    logo: '/assets/competitions/logos/clash-royale.webp',
    character: '/assets/competitions/characters/character-clash-royale.webp',
    type: 'competicion',
  },
  {
    id: 'smash',
    card: '/assets/competitions/cards/smash.webp',
    logo: '/assets/competitions/logos/smash.webp',
    character: '/assets/competitions/characters/character-smash.webp',
    type: 'competicion',
  },
  {
    id: 'minecraft',
    card: '/assets/competitions/cards/minecraft.webp',
    logo: '/assets/competitions/logos/minecraft.webp',
    character: '/assets/competitions/characters/character-minecraft.webp',
    type: 'competicion',
  },
  {
    id: '2XKO',
    card: '/assets/competitions/cards/2xko.webp',
    logo: '/assets/competitions/logos/2xko.webp',
    character: '/assets/competitions/characters/character-2xko.webp',
    type: 'reto',
  },
  {
    id: 'street-fighter',
    card: '/assets/competitions/cards/street-fighter.webp',
    logo: '/assets/competitions/logos/street-fighter.webp',
    character: '/assets/competitions/characters/character-street-fighter.webp',
    type: 'reto',
  },
  {
    id: 'f1',
    card: '/assets/competitions/cards/f1.webp',
    logo: '/assets/competitions/logos/f1.webp',
    character: '/assets/competitions/characters/character-f1.webp',
    type: 'reto',
  },
  {
    id: 'futbolin',
    card: '/assets/competitions/cards/futbolin.webp',
    logo: '/assets/competitions/logos/futbolin.webp',
    character: '/assets/competitions/characters/character-futbolin.webp',
    type: 'reto',
  },
  {
    id: 'retro',
    card: '/assets/competitions/cards/retro.webp',
    logo: '/assets/competitions/logos/retro.webp',
    character: '/assets/competitions/characters/character-retro.webp',
    type: 'reto',
  },
  {
    id: 'beat-saber',
    card: '/assets/competitions/cards/beat-saber.webp',
    logo: '/assets/competitions/logos/beat-saber.webp',
    character: '/assets/competitions/characters/character-beat-saber.webp',
    type: 'reto',
  },
  {
    id: 'hacking',
    card: '/assets/competitions/cards/hacking.webp',
    logo: '/assets/competitions/logos/hacking.webp',
    character: '/assets/competitions/characters/character-hacking.webp',
    type: 'reto',
  },
  {
    id: 'ajedrez',
    card: '/assets/competitions/cards/ajedrez.webp',
    logo: '/assets/competitions/logos/ajedrez.webp',
    character: '/assets/competitions/characters/character-ajedrez.webp',
    type: 'reto',
  },
  {
    id: 'ping-pong',
    card: '/assets/competitions/cards/ping-pong.webp',
    logo: '/assets/competitions/logos/ping-pong.webp',
    character: '/assets/competitions/characters/character-ping-pong.webp',
    type: 'reto',
  },
  {
    id: 'tetris',
    card: '/assets/competitions/cards/tetris.webp',
    logo: '/assets/competitions/logos/tetris.webp',
    character: '/assets/competitions/characters/character-tetris.webp',
    type: 'reto',
  },
  {
    id: 'cars',
    card: '/assets/competitions/cards/cars.webp',
    logo: '/assets/competitions/logos/cars.webp',
    character: '/assets/competitions/characters/character-cars.webp',
    type: 'reto',
  },
  {
    id: 'street-pass',
    card: '/assets/competitions/cards/street-pass.webp',
    logo: '/assets/competitions/logos/street-pass.webp',
    character: '/assets/competitions/characters/character-street-pass.webp',
    type: 'actividad',
  },
  {
    id: 'watch-party',
    card: '/assets/competitions/cards/watch-party.webp',
    logo: '/assets/competitions/logos/watch-party.webp',
    character: '/assets/competitions/characters/character-watch-party.webp',
    type: 'actividad',
  },
  {
    id: 'tcg',
    card: '/assets/competitions/cards/tcg.webp',
    logo: '/assets/competitions/logos/tcg.webp',
    character: '/assets/competitions/characters/character-tcg.webp',
    type: 'actividad',
  },
  {
    id: 'indie-fest',
    card: '/assets/competitions/cards/indie-fest.webp',
    logo: '/assets/competitions/logos/indie-fest.webp',
    character: '/assets/competitions/characters/character-indie-fest.webp',
    type: 'actividad',
  },
  {
    id: 'juego-libre',
    card: '/assets/competitions/cards/juego-libre.webp',
    logo: '/assets/competitions/logos/juego-libre.webp',
    character: '/assets/competitions/characters/character-juego-libre.webp',
    type: 'actividad',
  },
  {
    id: 'paella',
    card: '/assets/competitions/cards/paella.webp',
    logo: '/assets/competitions/logos/paella.webp',
    character: '/assets/competitions/characters/character-paella.webp',
    type: 'actividad',
  },
];
