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
];

export const CompetitionsCards: CompetitionCardData[] = [
  {
    id: "fc-25",
    card: "../../public/assets/competitions/cards/fc25.png",
    logo: "../../public/assets/competitions/game-logos/fc25.webp",
    character: "../../public/assets/competitions/card-characters/character-fc25.png",
  },
  {
    id: "minecraft",
    card: "../../public/assets/competitions/backgrounds/minecraft.png",
    logo: "../../public/assets/competitions/game-logos/minecraft.png",
    character: "../../public/assets/competitions/card-characters/character-minecraft.png",
  },
  {
    id: "mario-kart",
    card: "../../public/assets/competitions/backgrounds/mario-kart.png",
    logo: "../../public/assets/competitions/game-logos/mario.png",
    character: "../../public/assets/competitions/card-characters/character-mario.png",
  },
  {
    id: "league-of-legends",
    card: "../../public/assets/competitions/backgrounds/lol.jpeg",
    logo: "../../public/assets/competitions/game-logos/lol.png",
    character: "../../public/assets/competitions/card-characters/character-lol.webp",
  },
  {
    id: "valorant",
    card: "../../public/assets/competitions/backgrounds/valorant.png",
    logo: "../../public/assets/competitions/game-logos/valorant.png",
    character: "../../public/assets/competitions/card-characters/",
  },
  {
    id: "rocket-league",
    card: "../../public/assets/competitions/backgrounds/rocket-league.png",
    logo: "../../public/assets/competitions/game-logos/rocket.png",
    character: "../../public/assets/competitions/card-characters/character-rocket.png",
  },
  {
    id: "wii-sports",
    card: "../../public/assets/competitions/backgrounds/wii-sports.png",
    logo: "../../public/assets/competitions/game-logos/wii.png",
    character: "../../public/assets/competitions/card-characters/",
  },
  {
    id: "smash",
    card: "../../public/assets/competitions/backgrounds/smash.png",
    logo: "../../public/assets/competitions-logos/smash.png",
    character: "../../public/assets/competitions/card-characters/",
  },
];