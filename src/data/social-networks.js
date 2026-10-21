export const socialEditions = [2026, 2025, 2024, 2023, 2022];

export const socialNetworks = [
  {
    id: 'x',
    name: 'Twitter / X',
    handle: '@ulpugr',
    href: 'https://twitter.com/ulpugr',
    unit: 'seguidores',
    history: [813, 796, 761, 762, 645],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@ulpugr',
    href: 'https://www.instagram.com/ulpugr/',
    unit: 'seguidores',
    history: [1185, 391, 296, 250, 185],
  },
  {
    id: 'discord',
    name: 'Discord',
    handle: 'La comunidad ULP',
    href: 'https://discord.gg/FWW9wKZjav',
    unit: 'miembros',
    history: [327, 315, 308, null, null],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    handle: '@ugr_lan_party',
    href: 'https://www.twitch.tv/ugr_lan_party',
    unit: 'seguidores',
    history: [219, 172, 135, 68, 5],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@ugrlanparty',
    href: 'https://www.tiktok.com/@ugrlanparty',
    unit: 'seguidores',
    history: [97, 50, 27, null, null],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@ugrlanparty',
    href: 'https://www.youtube.com/@ugrlanparty',
    unit: 'suscriptores',
    history: [56, 24, 12, 3, null],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'UGR LAN Party',
    href: 'https://www.facebook.com/UGRLanParty/',
    unit: 'seguidores',
    history: [193, 193, 193, 193, 193],
  },
];

export const socialEditionTotals = socialEditions.map((_, column) =>
  socialNetworks.reduce(
    (total, network) => total + (network.history[column] ?? 0),
    0,
  ),
);
