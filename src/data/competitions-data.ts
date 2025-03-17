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
    rules: "https://drive.google.com/file/d/1KBCYVnNKJ2m4Q_j5CSHq4n1lUZmxoqAd/view?usp=drive_link",
    registration: "https://forms.gle/kHXsJTe3g5SjqTKs6",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1AdKrHgEqGMnNu_pxCN6ERlo6STzh1MtP/view?usp=sharing",
    time: "10:00",
    place: ["Aula A1", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/fc.webp",
    trophy: "/assets/models/fc-25.obj",
  },
  {
    id: "minecraft",
    name: "Minecraft",
    rules: "https://drive.google.com/file/d/1_eVDYx9was7lMLm0LiJzEakdfUdOOQ7f/view?usp=drive_link",
    registration: "https://forms.gle/iuYJNF8kDWtVwmZ16",
    registrationPeriodOpen: true,
    participants: "https://drive.google.com/file/d/1mfOE0-qC7HxUAxlkT0LbDkuDS4IxQJ0q/view?usp=sharing",
    time: "15:30",
    place: ["Aula B1", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/minecraft.webp",
    trophy: "/assets/models/minecraft.obj",
  },
  {
    id: "mario-kart",
    name: "Mario Kart 8 Deluxe",
    rules: "https://drive.google.com/file/d/1SP9zxLgV6QBD36V8jUksmjPI5gg051Kt/view?usp=drive_link",
    registration: "https://forms.gle/gXXBEi6uS5JJ2fdU8",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1slVr_e_8o76RVzIz8ji_BcCdtlqzGske/view?usp=sharing",
    time: "16:30",
    place: ["Aulas -1.1 y -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/mario-kart.webp",
    trophy: "/assets/models/mario-kart.obj",
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    rules: "https://drive.google.com/file/d/1eWemc-2lhWcy81stMaKWEZe92TU_DIJH/view?usp=drive_link",
    registration: "https://forms.gle/W1rza8HK2UH6Hbpa7",
    registrationPeriodOpen: true,
    participants: "https://drive.google.com/file/d/1JSpGlIdGQmjXgxfyyiB_vjPI5egpqOcM/view?usp=sharing",
    time: "10:00",
    place: ["Aula B1", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/lol.webp",
    trophy: "/assets/models/league-of-legends.obj",
  },
  {
    id: "valorant",
    name: "Valorant",
    rules: "https://drive.google.com/file/d/1arYwliYEhKM7AUeXROuzHF-Bf7iJhPRI/view?usp=drive_link",
    registration: "https://forms.gle/79agiKuf9Zrf1YoX6",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1OQKJtdHobpfC6RZ7mMKT1ivVX5jV1Q7r/view?usp=sharing",
    time: "10:00",
    place: ["Aula A2", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/valorant.webp",
    trophy: "/assets/models/valorant.obj",
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    rules: "https://drive.google.com/file/d/16k3FnsHeWu36lwKaJwJajKKlpcPLcfIn/view?usp=drive_link",
    registration: "https://forms.gle/ZBi4qcr7svX6Sba69",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1K75hYQ_ktlPncv_ubp4aLSqDaycWUKT4/view?usp=sharing",
    time: "15:30",
    place: ["Aula A2", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/rocket-league.webp",
    trophy: "/assets/models/rocket-league.obj",
  },
  {
    id: "wii-sports-tenis",
    name: "Wii Sports Tenis",
    rules: "https://drive.google.com/file/d/1VO_NCYy_wJo-7MA_BZEsttZJUWiknnuS/view?usp=drive_link",
    registration: "https://forms.gle/5jiNDTjhk3hZTbZp8",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1suPy_eEYJCs7xLMTK4FFCUBSEJca1PJY/view?usp=sharing",
    time: "17:00",
    place: ["Aula A1", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/wii-tenis.webp",
    trophy: "/assets/models/wii-sports.obj",
  },
  {
    id: "wii-sports-bolos",
    name: "Wii Sports Bolos",
    rules: "https://drive.google.com/file/d/1Mhq-ee0y76jIhDh1Ha1opyxt0OD-m1Xq/view?usp=drive_link",
    registration: "https://forms.gle/AZdTMt1KZJFcqPPUA",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1U49FfxqMYP907FT9u_BBoI63LW4DkAwu/view?usp=sharing",
    time: "10:00",
    place: ["Aulas -1.1 y -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/wii-bolos.webp",
    trophy: "/assets/models/wii-sports.obj",
  },
  {
    id: "smash",
    name: "Super Smash Bros Ultimate",
    rules: "https://drive.google.com/file/d/1Sqggc4Aub52DJXdIpKd38Yl3QdqQHb-_/view?usp=drive_link",
    registration: "https://forms.gle/8Vd425yMriEJ9Z4a9",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/1LZ2FgVRAduAPypOy_dtTDlY_9kg23qf9/view?usp=sharing",
    time: "10:00",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/smash.webp",
    trophy: "/assets/models/smash.obj",
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
    rules: "https://drive.google.com/file/d/1cL7Lrf2DJGcEEHoDZnR351TM8tvQHj2j/view?usp=drive_link",
    registration: "https://forms.gle/cDYSmqfsebQFvDzK6",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/10ni3aIMWBuJc9Sk458sdZ8xzq71GK_il/view?usp=sharing",
    time: "10:00",
    place: ["Aula B1", "Prefabricadas patio"],
    backgroundImage: "/assets/competitions/backgrounds/brawl-stars.webp",
    trophy: "/assets/models/brawl-stars.obj",
  },
  {
    id: "dragon-ball",
    name: "Dragon Ball Sparking Zero",
    rules: "",
    registration: "https://forms.gle/gTW14FsJsHeNSWSz8",
    registrationPeriodOpen: false,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/dragon-ball.webp",
    trophy: "/assets/models/dragon-ball.obj",
  },
  {
    id: "f1",
    name: "F1",
    rules: "",
    registration: "https://forms.gle/yJr9pVwbSMY5KKn29",
    registrationPeriodOpen: false,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/f1.webp",
    trophy: "/assets/models/f1.obj",
  },
  {
    id: "futbolin",
    name: "Futbolín",
    rules: "https://drive.google.com/file/d/1_13VbVHWr5L-Qt9PwmsLtZb6ImDQkKY7/view?usp=drive_link",
    registration: "https://forms.gle/1iNwZ5xw8JXnsyeG6",
    registrationPeriodOpen: false,
    participants: "https://drive.google.com/file/d/19CoHOAjvX6oWvWLWNn4O4b_SFajgg_VD/view?usp=sharing",
    time: "10:00",
    place: ["Entrada", "Entrada rejas patio"],
    backgroundImage: "/assets/competitions/backgrounds/futbolin.webp",
    trophy: "/assets/models/futbolin.obj",
  },
  {
    id: "retro",
    name: "Juego Retro",
    rules: "",
    registration: "",
    registrationPeriodOpen: false,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/retro.webp",
    trophy: "",
  },
  {
    id: "street-fighter",
    name: "Street Fighter II",
    rules: "",
    registration: "",
    registrationPeriodOpen: false,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/street-fighter.webp",
    trophy: "",
  },
  {
    id: "beat-saber",
    name: "Beat Saber",
    rules: "",
    registration: "",
    registrationPeriodOpen: false,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/beat-saber.webp",
    trophy: "",
  },
  {
    id: "hacking",
    name: "Hacking Ético",
    rules: "",
    registration: "https://ctf.hackiit.org",
    registrationPeriodOpen: true,
    participants: "",
    time: "Todo el día",
    place: ["Aula -1.2", "Bajando escaleras futbolín"],
    backgroundImage: "/assets/competitions/backgrounds/hacking.webp",
    trophy: "",
  },
];

export const CompetitionsCards: CompetitionCardData[] = [
  {
    id: "mario-kart",
    card: '/assets/competitions/cards/mario-kart.webp',
    logo: '/assets/competitions/logos/mario.webp',
    character: '/assets/competitions/characters/character-mario.webp',
  },
  {
    id: "wii-sports-tenis",
    card: '/assets/competitions/cards/wii-tenis.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-tenis.webp',
  },
  {
    id: "wii-sports-bolos",
    card: '/assets/competitions/cards/wii-bolos.webp',
    logo: '/assets/competitions/logos/wii.webp',
    character: '/assets/competitions/characters/wii-bolos.webp',
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
  {
    id: "dragon-ball",
    card: '/assets/competitions/cards/dragon-ball.webp',
    logo: '/assets/competitions/logos/dragon-ball.webp',
    character:
      '/assets/competitions/characters/character-dragon-ball.webp',
  },
  {
    id: "f1",
    card: '/assets/competitions/cards/f1.webp',
    logo: '/assets/competitions/logos/f1.webp',
    character:
      '/assets/competitions/characters/character-f1.webp',
  },
  {
    id: "futbolin",
    card: '/assets/competitions/cards/futbolin.webp',
    logo: '/assets/competitions/logos/futbolin.webp',
    character:
      '/assets/competitions/characters/character-futbolin.webp',
  },
  {
    id: "retro",
    card: '/assets/competitions/cards/retro.webp',
    logo: '/assets/competitions/logos/retro.webp',
    character:
      '/assets/competitions/characters/character-retro.webp',
  },
  {
    id: "beat-saber",
    card: '/assets/competitions/cards/beat-saber.webp',
    logo: '/assets/competitions/logos/beat-saber.webp',
    character:
      '/assets/competitions/characters/character-beat-saber.webp',
  },
  {
    id: "hacking",
    card: '/assets/competitions/cards/hacking.webp',
    logo: '/assets/competitions/logos/hacking.webp',
    character:
      '/assets/competitions/characters/character-hacking.webp',
  },
  {
    id: "street-fighter",
    card: '/assets/competitions/cards/street-fighter.webp',
    logo: '/assets/competitions/logos/street-fighter.webp',
    character:
      '/assets/competitions/characters/character-street-fighter.webp',
  },
];