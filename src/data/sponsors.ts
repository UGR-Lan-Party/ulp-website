export interface SponsorData {
  name: string;
  tier: string;
  logo: string;
  bussiness: string;
  description: string;
  links: SponsorLink[];
}

export interface SponsorLink {
  rrss: string;
  link: string;
}

const Sponsors: SponsorData[] = [
  {
      name: "T-Systems Iberia",
      tier: 'platinum',
      logo: '/assets/participan/Color/Empresas/t-systems.png',
      bussiness: "Servicios y Consultoría de TI",
      description: "Empresa multinacional de servicios de tecnologías de la información y comunicación, del grupo Deutsche Telekom. Ofrece servicios de consultoría, integración de sistemas, servicios gestionados y outsourcing.",
      links: [
        {
          rrss: "Web",
          link: "https://www.t-systems.com/es/es",
        },
        {
          rrss: "LinkedIn",
          link: "https://www.linkedin.com/company/tsystems-iberia/",
        },
        {
          rrss: "Instagram",
          link: "https://www.instagram.com/tsystems_iberia/",
        },
      ]
  },
  {
    name: "Arena Gaming Granada",
    tier: 'gold',
    logo: '/assets/participan/Color/Empresas/arena-gaming.png',
    bussiness: "Centro de gaming y esports",
    description: "Espacio de ocio y entretenimiento en el que se disfruta la mejor experiencia de juego en consolas, PC y realidad virtual. Además, cuenta con una zona de restauración y una tienda especializada en videojuegos.",
    links: [
        {
          rrss: "Web",
          link: "https://www.arenagaming.es/",
        },
        {
          rrss: "X",
          link: "https://x.com/arenaprogaming",
        },
        {
          rrss: "Instagram",
          link: "https://www.instagram.com/arenaprogaming/",
        },
        {
          rrss: "Facebook",
          link: "https://www.facebook.com/arenagranada/",
        },
      ]
  },
  {
      name: "Nazaríes Intelligenia",
      tier: 'gold',
      description: "Consultora tecnológica especializada en el desarrollo de software a medida y en el desarrollo de soluciones tecnológicas en el ámbito de la monitorización y sensorización.  Cuentan con más de 10 años de experiencia en desarrollo de software.",
      logo: '/assets/participan/Color/Empresas/nazaríes.png',
      bussiness: "Servicios y consultoría de TI",
      links: [
        {
          rrss: "Web",
          link: "https://www.nazaries.com",
        },
        {
          rrss: "X",
          link: "https://twitter.com/intelligenia",
        },
        {
          rrss: "Instagram",
          link: "https://www.instagram.com/nazaries_intelligenia/",
        },
        {
          rrss: "LinkedIn",
          link: "https://www.linkedin.com/company/nazaries-intelligenia/",
        },
      ]
  },

  {
    name: "Cátedra Telefónica",
    tier: 'silver',
    logo: '/assets/participan/Color/Empresas/catedra-telefonica.png',
    bussiness: "Cátedra académica para impulsar las TIC",
    description: "Colaboraciones entre Telefónica y universidades españolas, que promueven la formación, investigación y transferencia de conocimiento TIC. Impulsan la innovación tecnológica en la sociedad, favoreciendo al ámbito académico y al empresarial.",
    links: [
      {
        rrss: "Web",
        link: "https://catedras.ugr.es/telefonica/",
      },
    ]
  },
  {
    name: "GRANAJOVEN ",
    tier: 'silver',
    logo: '/assets/participan/Color/Empresas/concejalia-juventud.png',
    bussiness: "Concejalía de Juventud Ayto. de Granada",
    description: "Granajoven es la Concejalía de Juventud del Ayuntamiento de Granada, dedicada a promover actividades culturales, formativas y de ocio para jóvenes, fomentando su participación activa en la sociedad.",
    links: 
    [
      {
        rrss: "Web",
        link: "https://www.granada.org/inet/juventud.nsf/",
      },
      {
        rrss: "X",
        link: "https://x.com/granajoven",
      },
      {
        rrss: "Instagram",
        link: "https://www.instagram.com/aytogr/",
      },
      {
        rrss: "Facebook",
        link: "https://www.facebook.com/granajoven/",
      },
    ]
  },
  {
      name: "Cívica Software",
      tier: 'bronze',
      description: "Empresa del sector tecnológico especializada en la implantación de estrategias de autoservicio, BI operacional, uso de tecnologías Big Data y arquitecturas federadas que simplifiquen la utilización de datos  a nivel corporativo con la mayor sencillez y fiabilidad.",
      logo: '/assets/participan/Color/Empresas/cívica.png',
      bussiness: "Servicios y Consultoría de TI",
      links: 
      [
        {
          rrss: "Web",
          link: "https://civica-soft.com",
        },
        {
          rrss: "LinkedIn",
          link: "https://www.linkedin.com/company/civica-soft/",
        },
        {
          rrss: "Instagram",
          link: "https://www.instagram.com/civica.official/",
        },
      ]
  },
  {
    name: "Fórmula Karting Granada",
    tier: 'bronze',
    description: "Destino predilecto para los aficionados al karting y la velocidad en Granada. Con instalaciones de primera línea diseñadas para ofrecer la máxima emoción y seguridad, este circuito para poner a prueba tanto a principiantes como a pilotos experimentados.",
    logo: '/assets/participan/Color/Empresas/formula-karting.png',
    bussiness: "Circuito indoor de karts en Granada",
    links: [
      {
        rrss: "Web",
        link: "https://www.formulakarting.es/",
      },
    ]
  },
  {
    name: "SIDN Digital Thinking",
    tier: 'bronze',
    description: "Consultora de negocio digital fundada en 2002, especializada en servicios de marketing digital e innovación. La empresa ayuda a las organizaciones a desarrollar su presencia en el ámbito digital, ofreciendo soluciones en SEO, analytics, CRM, IA y cloud marketing.",
    logo: '/assets/participan/Color/Empresas/sidn.webp',
    bussiness: "Servicios y Consultoría de TI",
    links: 
    [
      {
        rrss: "Web",
        link: "https://www.sidn.es/",
      },
      {
        rrss: "LinkedIn",
        link: "https://www.linkedin.com/company/agencia-sidn/",
      },
    ]
  },
  {
    name: "The Game Kitchen",
    tier: 'bronze',
    description: "Estudio de desarrollo de videojuegos independiente de Sevilla. Especializados en títulos de aventura y acción con estética retro y temáticas inspiradas en el folclore andaluz. Son conocidos por juegos como “The Last Door” y “Blasphemous”.",
    logo: '/assets/participan/Color/Empresas/game-kitchen.png',
    bussiness: "Desarrolladora de videojuegos",
    links: 
    [
      {
        rrss: "Web",
        link: "https://thegamekitchen.com/",
      },
      {
        rrss: "LinkedIn",
        link: "https://www.linkedin.com/company/the-game-kitchen/",
      },
      {
        rrss: "X",
        link: "https://x.com/TheGameKitchen",
      },
    ]
  },
];

export const sponsorsPlatinum: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'platinum',
);
export const sponsorsGold: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'gold',
);
export const sponsorsSilver: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'silver',
);
export const sponsorsBronze: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'bronze',
);