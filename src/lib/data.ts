export interface CompetitionData {
  id: string;
  name: string;
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
  },
  {
    id: "minecraft",
    name: "Minecraft",
  },
  {
    id: "mario-kart",
    name: "Mario Kart 8 Deluxe",
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
  },
  {
    id: "valorant",
    name: "Valorant",
  },
  {
    id: "rocket-league",
    name: "Rocket League",
  },
  {
    id: "wii-sports",
    name: "Wii Sports",
  },
  {
    id: "smash",
    name: "Super Smash Bros Ultimate",
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
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