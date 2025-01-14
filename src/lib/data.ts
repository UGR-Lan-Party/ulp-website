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
    card: '../../public/assets/competitions/cards/mario-kart.png',
    logo: '../../public/assets/competitions/logos/mario.png',
    character: '../../public/assets/competitions/characters/character-mario.png',
  },
  {
    id: "wii-sports",
    card: '../../public/assets/competitions/cards/wii.png',
    logo: '../../public/assets/competitions/logos/wii.png',
    character: '../../public/assets/competitions/characters/wii.png',
  },
  {
    id: "valorant",
    card: '../../public/assets/competitions/cards/valorant.png',
    logo: '../../public/assets/competitions/logos/valorant.png',
    character: '../../public/assets/competitions/characters/valorant.png',
  },
  {
    id: "league-of-legends",
    card: '../../public/assets/competitions/cards/lol.png',
    logo: '../../public/assets/competitions/logos/lol.png',
    character: '../../public/assets/competitions/characters/character-lol.webp',
  },

  {
    id: "rocket-league",
    card: '../../public/assets/competitions/cards/rocket.png',
    logo: '../../public/assets/competitions/logos/rocket.png',
    character: '../../public/assets/competitions/characters/character-rocket.png',
  },
  {
    id: "brawl-stars",
    card: '../../public/assets/competitions/cards/brawls-stars.png',
    logo: '../../public/assets/competitions/logos/brawl-stars.png',
    character:
      '../../public/assets/competitions/characters/character-brawl-stars.webp',
  },
  {
    id: "smash",
    card: '../../public/assets/competitions/cards/smash.png',
    logo: '../../public/assets/competitions/logos/smash.png',
    character: '../../public/assets/competitions/characters/character-smash.png',
  },
  {
    id: "fc-25",
    card: '../../public/assets/competitions/cards/fc25.png',
    logo: '../../public/assets/competitions/logos/fc25.webp',
    character: '../../public/assets/competitions/characters/character-fc25.png',
  },
  {
    id: "minecraft",
    card: '../../public/assets/competitions/cards/minecraft.png',
    logo: '../../public/assets/competitions/logos/minecraft.png',
    character:
      '../../public/assets/competitions/characters/character-minecraft.png',
  },
];