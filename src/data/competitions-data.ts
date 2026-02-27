export interface CompetitionData {
  id: string;
  name: string;
  rules: string;
  registration: string;
  registrationPeriodOpen: boolean;
  participants: string;
  time: string;
  place: string[];
  backgroundImage: string;
  trophy: string;
  awards?: Awards;
}

export interface CompetitionCardData {
  id: string;
  card: string;
  logo: string;
  character: string;
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
    name: 'ajedrez',
    rules:
      'https://drive.google.com/file/d/17o4kUmzgLb0nZHfv500aAdQbF3zxf2kh/view?usp=drive_link',
    registration: 'https://forms.gle/hRk68DAWJcEAStmf7',
    registrationPeriodOpen: true,
    participants:
      'https://drive.google.com/file/d/1mfOE0-qC7HxUAxlkT0LbDkuDS4IxQJ0q/view?usp=sharing',
    time: '15:30',
    place: ['Aula B1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/ajedrez.webp',
    trophy: '/assets/models/minecraft.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['Top Kills', 'x1 Tarjeta Amazon 25€'],
    },
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    rules:
      'https://drive.google.com/file/d/1kwPUjbZoteRiS6tscZkMRUrFqA_N3nfu/view?usp=drive_link',
    registration: 'https://forms.gle/X8fPY1enBJoHs7xD9',
    registrationPeriodOpen: true,
    participants: '',
    time: '15:30',
    place: ['Aula B1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/minecraft.webp',
    trophy: '/assets/models/minecraft.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['Top Kills', 'x1 Tarjeta Amazon 25€'],
    },
  },
  {
    id: 'mario-kart',
    name: 'Mario Kart World',
    rules:
      'https://drive.google.com/file/d/1_7tfC7cQTy7xc0yLtPpA56DRQd2cPMnM/view?usp=drive_link',
    registration: 'https://forms.gle/v1iYnEvuJYjfChjC7',
    registrationPeriodOpen: true,
    participants: '',
    time: '16:00',
    place: ['Aula A1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/mario-kart.webp',
    trophy: '/assets/models/mario-kart.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x1 Tarjeta Amazon 50€ ',
        'x3 Bonos Fórmula Karting',
      ],
      second: ['Trofeo y Medalla ULP', 'x3 Bonos Fórmula Karting'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    rules:
      'https://drive.google.com/file/d/16KEdp-ZYeGH3zD9nXfaQkkTGFz6GZVVn/view?usp=drive_link',
    registration: 'https://forms.gle/irjKuCsbp1pRMDh69',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aula B1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/lol.webp',
    trophy: '/assets/models/league-of-legends.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x10 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x5 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['x1 Tarjeta Amazon 25€'],
    },
  },
  {
    id: 'valorant',
    name: 'Valorant',
    rules:
      'https://drive.google.com/file/d/1kbVNC0yWN-2Awg0QtkNnTuvaW_gWQv_w/view?usp=drive_link',
    registration: 'https://forms.gle/LD8GxbuYMgMUxuxj8',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aula A2', 'Prefabricadas patio'],
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
  },
  {
    id: 'rocket-league',
    name: 'Rocket League',
    rules:
      'https://drive.google.com/file/d/1rOl9qPPdKn_TkVImEuAYJtxU1hMTq8yx/view?usp=drive_link',
    registration: 'https://forms.gle/wEgWNqQRuq1ocoPp9',
    registrationPeriodOpen: true,
    participants: '',
    time: '15:30',
    place: ['Aula A2', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/rocket-league.webp',
    trophy: '/assets/models/rocket-league.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x4 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
      mvp: ['x1 Tarjeta Amazon 25€'],
    },
  },
  {
    id: 'wii-sports-tenis',
    name: 'Wii Sports Tenis',
    rules:
      'https://drive.google.com/file/d/19lw2h7hCXiEpLwFO-bEwGF41YIl-IF1V/view?usp=drive_link',
    registration: 'https://forms.gle/HsQDEKmqzy92Ges47',
    registrationPeriodOpen: true,
    participants: '',
    time: '16:00',
    place: ['Aulas -1.1 y -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/wii-tenis.webp',
    trophy: '/assets/models/wii-sports.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x1 Tarjeta Amazon 50€',
        'x2 Viajes de un día',
      ],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'wii-sports-bolos',
    name: 'Wii Sports Bolos',
    rules:
      'https://drive.google.com/file/d/1emhSanMB98aI7M_aDgYjxzFL5x-ibYX4/view?usp=drive_link',
    registration: 'https://forms.gle/LmPpLQZMJSqLuzbw8',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aulas -1.1 y -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/wii-bolos.webp',
    trophy: '/assets/models/wii-sports.obj',
    awards: {
      first: [
        'Trofeo y Medalla ULP',
        'x2 Tarjetas Amazon 25€',
        'x2 Viajes de un día',
      ],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'smash',
    name: 'Super Smash Bros Ultimate',
    rules:
      'https://drive.google.com/file/d/1XCmukFJFxexuuAR9G0zOYl319Eg6nnAI/view?usp=drive_link',
    registration: 'https://forms.gle/psgLvwYrHsULbfDC7',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/smash.webp',
    trophy: '/assets/models/smash.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    rules:
      'https://drive.google.com/file/d/1Ea65hDtIyDuSvI1cyqJu1zMD5QSuLUNg/view?usp=drive_link',
    registration: 'https://forms.gle/TguVfCWCfjrMi92g6',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aula B1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/brawl-stars.webp',
    trophy: '/assets/models/brawl-stars.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x6 Tarjetas Amazon 25€'],
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
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Aula B1', 'Prefabricadas patio'],
    backgroundImage: '/assets/competitions/backgrounds/clash-royale.webp',
    trophy: '/assets/models/clash-royale.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x6 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x3 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: '2XKO',
    name: '2XKO',
    rules:
      'https://drive.google.com/file/d/1BMqIb4iaA_J6lE0TXf_cLCXfJpnlTxdT/view?usp=sharing',
    registration: '',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/2xko.webp',
    trophy: '/assets/models/2XKO.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x1 Tarjeta Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'f1',
    name: 'F1',
    rules: '',
    registration: '',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/f1.webp',
    trophy: '/assets/models/f1.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x4 Bonos Fórmula Karting'],
      second: ['Trofeo y Medalla ULP'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'futbolin',
    name: 'Futbolín',
    rules:
      'https://drive.google.com/file/d/1EDfhmMzzISQqQrboPw2ijqSF3tsrNVQt/view?usp=drive_link',
    registration: 'https://forms.gle/rWzswNKrAYvpgLRW6',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Entrada', 'Entrada çrejas patio'],
    backgroundImage: '/assets/competitions/backgrounds/futbolin.webp',
    trophy: '/assets/models/futbolin.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x4 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'ping-pong',
    name: 'Ping Pong',
    rules:
      'https://drive.google.com/file/d/1pgBs7yoMWEMQJNA4kMdEsWyWf1KNwxOP/view?usp=drive_link',
    registration: 'https://forms.gle/hxri8zkoXdnoogD69',
    registrationPeriodOpen: true,
    participants: '',
    time: '10:00',
    place: ['Entrada', 'Entrada çrejas patio'],
    backgroundImage: '/assets/competitions/backgrounds/ping-pong.webp',
    trophy: '/assets/models/ping-pong.obj',
    awards: {
      first: ['Trofeo y Medalla ULP', 'x4 Tarjetas Amazon 25€'],
      second: ['Trofeo y Medalla ULP', 'x2 Tarjetas Amazon 25€'],
      third: ['Trofeo y Medalla ULP'],
    },
  },
  {
    id: 'retro',
    name: 'Juego Retro',
    rules: '',
    registration: '',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/retro.webp',
    trophy: '',
    awards: {
      first: ['Llaveros e imanes frikis', 'x1 Tarjeta Amazon 25€'],
      second: ['Llaveros e imanes frikis', 'x2 Bonos Fórmula Karting'],
      third: ['Llaveros e imanes frikis'],
    },
  },
  {
    id: 'street-fighter',
    name: 'Street Fighter II',
    rules: '',
    registration: '',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/street-fighter.webp',
    trophy: '',
    awards: {
      first: ['Llaveros e imanes frikis', 'x1 Tarjeta Amazon 25€'],
      second: ['Llaveros e imanes frikis', 'x2 Bonos Fórmula Karting'],
      third: ['Llaveros e imanes frikis'],
    },
  },
  {
    id: 'beat-saber',
    name: 'Beat Saber',
    rules:
      'https://drive.google.com/file/d/1tbSdcSUhcJfHx5CHd2GCIMpFoV8RnaqU/view?usp=sharing',
    registration: '',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/beat-saber.webp',
    trophy: '',
    awards: {
      first: ['Llaveros e imanes frikis', 'x2 Bonos Fórmula Karting'],
      second: ['Llaveros e imanes frikis'],
      third: ['Llaveros e imanes frikis'],
    },
  },
  {
    id: 'hacking',
    name: 'Hacking Ético',
    rules:
      'https://drive.google.com/file/d/15_tPVyadkHryQsnfRhB-EPS4vA9KYybO/view?usp=drive_link',
    registration: 'https://forms.gle/PsfNEL5DswXSp4dH8',
    registrationPeriodOpen: true,
    participants: '',
    time: 'Todo el día',
    place: ['Aula -1.2', 'Bajando escaleras futbolín'],
    backgroundImage: '/assets/competitions/backgrounds/hacking.webp',
    trophy: '',
    awards: {
      first: ['Llaveros e imanes frikis', 'x1 Tarjeta Amazon 25€'],
      second: ['Llaveros e imanes frikis', 'x1 Tarjeta Amazon 25€'],
      third: ['Llaveros e imanes frikis'],
    },
  },
];

export const CompetitionsCards: CompetitionCardData[] = [
  {
    id: 'wii-sports-tenis',
    card: '/assets/competitions/cards/wii-tenis.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-tenis.webp',
  },
  {
    id: 'wii-sports-bolos',
    card: '/assets/competitions/cards/wii-bolos.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-bolos.webp',
  },
  {
    id: 'mario-kart',
    card: '/assets/competitions/cards/mario-kart.webp',
    logo: '/assets/competitions/logos/mario-kart.webp',
    character: '/assets/competitions/characters/character-mario.webp',
  },
  {
    id: 'valorant',
    card: '/assets/competitions/cards/valorant.webp',
    logo: '/assets/competitions/logos/valorant.webp',
    character: '/assets/competitions/characters/valorant.webp',
  },
  {
    id: 'league-of-legends',
    card: '/assets/competitions/cards/lol.webp',
    logo: '/assets/competitions/logos/lol.webp',
    character: '/assets/competitions/characters/character-lol.webp',
  },

  {
    id: 'rocket-league',
    card: '/assets/competitions/cards/rocket.webp',
    logo: '/assets/competitions/logos/rocket.webp',
    character: '/assets/competitions/characters/character-rocket.webp',
  },
  {
    id: 'brawl-stars',
    card: '/assets/competitions/cards/brawls-stars.webp',
    logo: '/assets/competitions/logos/brawl-stars.webp',
    character: '/assets/competitions/characters/character-brawl-stars.webp',
  },
  {
    id: 'clash-royale',
    card: '/assets/competitions/cards/clash-royale.webp',
    logo: '/assets/competitions/logos/clash-royale.webp',
    character: '/assets/competitions/characters/character-clash-royale.webp',
  },
  {
    id: 'smash',
    card: '/assets/competitions/cards/smash.webp',
    logo: '/assets/competitions/logos/smash.webp',
    character: '/assets/competitions/characters/character-smash.webp',
  },
  {
    id: 'minecraft',
    card: '/assets/competitions/cards/minecraft.webp',
    logo: '/assets/competitions/logos/minecraft.webp',
    character: '/assets/competitions/characters/character-minecraft.webp',
  },
  {
    id: '2XKO',
    card: '/assets/competitions/cards/2xko.webp',
    logo: '/assets/competitions/logos/2xko.webp',
    character: '/assets/competitions/characters/character-2xko.webp',
  },
  {
    id: 'street-fighter',
    card: '/assets/competitions/cards/street-fighter.webp',
    logo: '/assets/competitions/logos/street-fighter.webp',
    character: '/assets/competitions/characters/character-street-fighter.webp',
  },
  {
    id: 'f1',
    card: '/assets/competitions/cards/f1.webp',
    logo: '/assets/competitions/logos/f1.webp',
    character: '/assets/competitions/characters/character-f1.webp',
  },
  {
    id: 'futbolin',
    card: '/assets/competitions/cards/futbolin.webp',
    logo: '/assets/competitions/logos/futbolin.webp',
    character: '/assets/competitions/characters/character-futbolin.webp',
  },
  {
    id: 'retro',
    card: '/assets/competitions/cards/retro.webp',
    logo: '/assets/competitions/logos/retro.webp',
    character: '/assets/competitions/characters/character-retro.webp',
  },
  {
    id: 'beat-saber',
    card: '/assets/competitions/cards/beat-saber.webp',
    logo: '/assets/competitions/logos/beat-saber.webp',
    character: '/assets/competitions/characters/character-beat-saber.webp',
  },
  {
    id: 'hacking',
    card: '/assets/competitions/cards/hacking.webp',
    logo: '/assets/competitions/logos/hacking.webp',
    character: '/assets/competitions/characters/character-hacking.webp',
  },
  {
    id: 'ajedrez',
    card: '/assets/competitions/cards/ajedrez.webp',
    logo: '/assets/competitions/logos/ajedrez.webp',
    character: '/assets/competitions/characters/character-ajedrez.webp',
  },
  {
    id: 'ping-pong',
    card: '/assets/competitions/cards/ping-pong.webp',
    logo: '/assets/competitions/logos/ping-pong.webp',
    character: '/assets/competitions/characters/character-ping-pong.webp',
  },
];
