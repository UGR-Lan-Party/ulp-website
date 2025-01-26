export interface CompetitionData {
  id: string;
  name: string;
  rules: string;
  registration: string;
  time: string;
  place: string[];
}

export interface CompetitionCardData {
  id: string;
  card: string;
  logo: string;
  character: string;
}

export const Competitions: CompetitionData[] = [
  {
    id: "fc-25",
    name: "FC25",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "minecraft",
    name: "Minecraft",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "mario-kart",
    name: "Mario Kart 8 Deluxe",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "valorant",
    name: "Valorant",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "wii-sports",
    name: "Wii Sports",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "smash",
    name: "Super Smash Bros Ultimate",
    rules: "",
    registration: "",
    time: "12:30",
    place: ["Aula A2", "Prefabricadas patio"],
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
    rules: "",
    registration: "",
    time: "12:30 - 14:00",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
  },
];

export const CompetitionsCards: CompetitionCardData[] = [
  {
    id: "mario-kart",
    card: 'assets/competitions/cards/mario-kart.webp',
    logo: 'assets/competitions/logos/mario.webp',
    character: 'assets/competitions/characters/character-mario.webp',
  },
  {
    id: "wii-sports",
    card: '/assets/competitions/cards/wii.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii.webp',
  },
  {
    id: "valorant",
    card: '/assets/competitions/cards/valorant.webp',
    logo: '/assets/competitions/logos/valorant.webp',
    character: '/assets/competitions/characters/valorant.webp',
  },
  {
    id: "league-of-legends",
    card: '/assets/competitions/cards/lol.webp',
    logo: '/assets/competitions/logos/lol.webp',
    character: '/assets/competitions/characters/character-lol.webp',
  },

  {
    id: "rocket-league",
    card: '/assets/competitions/cards/rocket.webp',
    logo: '/assets/competitions/logos/rocket.webp',
    character: '/assets/competitions/characters/character-rocket.webp',
  },
  {
    id: "brawl-stars",
    card: '/assets/competitions/cards/brawls-stars.webp',
    logo: '/assets/competitions/logos/brawl-stars.webp',
    character:
      '/assets/competitions/characters/character-brawl-stars.webp',
  },
  {
    id: "smash",
    card: '/assets/competitions/cards/smash.webp',
    logo: '/assets/competitions/logos/smash.webp',
    character: '/assets/competitions/characters/character-smash.webp',
  },
  {
    id: "fc-25",
    card: '/assets/competitions/cards/fc25.webp',
    logo: '/assets/competitions/logos/fc25.webp',
    character: '/assets/competitions/characters/character-fc25.webp',
  },
  {
    id: "minecraft",
    card: '/assets/competitions/cards/minecraft.webp',
    logo: '/assets/competitions/logos/minecraft.webp',
    character:
      '/assets/competitions/characters/character-minecraft.webp',
  },
];