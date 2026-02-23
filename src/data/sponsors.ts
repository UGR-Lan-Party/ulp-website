export interface SponsorData {
  name: string;
  tier: string;
  logo: string;
  cardBg: string | null;
  isSecret: boolean;
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
    name: 'Patrocinador Secreto',
    tier: 'gold',
    logo: '/assets/participan/Color/Empresas/secretSponsor.png',
    cardBg: '/assets/participan/BG-Sponsors/secretSponsor.webp',
    isSecret: true,
    bussiness: '???',
    description:
      'Aliado estratégico fundamental cuya visión y apoyo hacen posible la ejecución de este proyecto. Una organización comprometida con la innovación que impulsa el crecimiento de nuestra comunidad a través de esta alianza.',
    links: [
      {
        rrss: 'Web',
        link: 'https://ulp.ugr.es/',
      },
      {
        rrss: 'TikTok',
        link: 'https://tiktok.com/@ugrlanparty',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/ulpugr',
      },
      {
        rrss: 'X',
        link: 'https://twitter.com/ulpugr',
      },
    ],
  },
  {
    name: 'T-Systems Iberia',
    tier: 'diamond',
    logo: '/assets/participan/Color/Empresas/t-systems.png',
    cardBg: '/assets/participan/BG-Sponsors/T-system.webp',
    isSecret: false,
    bussiness: 'Servicios y Consultoría de TI',
    description:
      'Empresa multinacional de servicios de tecnologías de la información y comunicación, del grupo Deutsche Telekom. Ofrece servicios de consultoría, integración de sistemas, servicios gestionados y outsourcing.',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.t-systems.com/es/es',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/tsystems-iberia/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/tsystems_iberia/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/TSystems_Iberia',
      },
    ],
  },
  {
    name: 'Gen.G Global Academy',
    tier: 'diamond',
    description:
      'Prestigiosa organización global de esports con sede en Seúl y Los Ángeles, conocida por competir al más alto nivel en juegos como LOL(LCK) y VALORANT destacando por ser una de las empresas más valiosas de ESports.',
    logo: '/assets/participan/Color/Empresas/geng.webp',
    cardBg: '/assets/participan/BG-Sponsors/geng.webp',
    isSecret: false,
    bussiness: 'Academia de ESports',
    links: [
      {
        rrss: 'Web',
        link: 'https://en.ggacademy.gg/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/geng-esports/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/gengacademy_intl/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/gengacademy',
      },
    ],
  },
  {
    name: 'SIDN Digital Thinking',
    tier: 'diamond',
    description:
      'Consultora de negocio digital fundada en 2002, especializada en servicios de marketing digital e innovación. La empresa ayuda a las organizaciones a desarrollar su presencia en el ámbito digital, ofreciendo soluciones en SEO, analytics, CRM, IA y cloud marketing.',
    logo: '/assets/participan/Color/Empresas/sidn.webp',
    cardBg: '/assets/participan/BG-Sponsors/sidn.webp',
    isSecret: false,
    bussiness: 'Servicios y Consultoría de TI',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.sidn.es/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/agencia-sidn/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/sidn_es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/sidn_es',
      },
    ],
  },
  {
    name: 'LSI',
    tier: 'platinum',
    description:
      'Departamento de Lenguajes y Sistemas Informáticos de la Universidad. Fundado en 1989, imparte docencia en 20 grados y 15 másteres, en materias relacionadas con la ingeniería del software, sistemas operativos, metodologías de desarrollo, ingeniería web, sistemas gráficos, concurrentes, distribuidos, bases de datos...',
    logo: '/assets/participan/Color/Organismos/lsi.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Departamento de la UGR',
    links: [
      {
        rrss: 'Web',
        link: 'https://lsi.ugr.es/',
      },
    ],
  },
  {
    name: 'Nazaríes Intelligenia',
    tier: 'silver',
    description:
      'Consultora tecnológica especializada en el desarrollo de software a medida y en el desarrollo de soluciones tecnológicas en el ámbito de la monitorización y sensorización.  Cuentan con más de 10 años de experiencia en desarrollo de software.',
    logo: '/assets/participan/Color/Empresas/nazaríes.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Servicios y consultoría de TI',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.nazaries.com',
      },
      {
        rrss: 'X',
        link: 'https://twitter.com/intelligenia',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/nazaries_intelligenia/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/nazaries-intelligenia/',
      },
    ],
  },
  {
    name: 'GRANAJOVEN ',
    tier: 'gold',
    logo: '/assets/participan/Color/Empresas/concejalia-juventud.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Concejalía de Juventud Ayto. de Granada',
    description:
      'Granajoven es la Concejalía de Juventud del Ayuntamiento de Granada, dedicada a promover actividades culturales, formativas y de ocio para jóvenes, fomentando su participación activa en la sociedad.',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.granada.org/inet/juventud.nsf/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/granajoven',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/aytogr/',
      },
      {
        rrss: 'Facebook',
        link: 'https://www.facebook.com/granajoven/',
      },
    ],
  },
  {
    name: 'Cívica Software',
    tier: 'gold',
    description:
      'Empresa del sector tecnológico especializada en la implantación de estrategias de autoservicio, BI operacional, uso de tecnologías Big Data y arquitecturas federadas que simplifiquen la utilización de datos  a nivel corporativo con la mayor sencillez y fiabilidad.',
    logo: '/assets/participan/Color/Empresas/cívica.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Servicios y Consultoría de TI',
    links: [
      {
        rrss: 'Web',
        link: 'https://civica-soft.com',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/civica-soft/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/civica.official/',
      },
    ],
  },
  {
    name: 'Fórmula Karting Granada',
    tier: 'bronze',
    description:
      'Destino predilecto para los aficionados al karting y la velocidad en Granada. Con instalaciones de primera línea diseñadas para ofrecer la máxima emoción y seguridad, este circuito para poner a prueba tanto a principiantes como a pilotos experimentados.',
    logo: '/assets/participan/Color/Empresas/formula-karting.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Circuito indoor de karts en Granada',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.formulakarting.es/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/formulakarting/',
      },
      {
        rrss: 'YouTube',
        link: 'https://www.youtube.com/@ClubFormulaKartingGranada',
      },
    ],
  },

  {
    name: 'UGR',
    tier: 'regular',
    description:
      'Universidad pública española con sede en Granada y con campus en las ciudades de Granada, Ceuta y Melilla. Reconocida como una de las 10 mejores universidades de España y entre las 500 mejores del mundo. Recibe cada año más de 2000 alumnos del programa Erasmus, siendo el destino europeo favorito.​',
    logo: '/assets/participan/Color/Organismos/ugr.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Universidad de Granada',
    links: [
      {
        rrss: 'Web',
        link: 'https://ugr.es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/canalugr',
      },
      {
        rrss: 'Facebook',
        link: 'https://www.facebook.com/universidadgranada/',
      },
      {
        rrss: 'YouTube',
        link: 'https://www.youtube.com/user/UGRmedios',
      },
    ],
  },
  {
    name: 'ETSIIT',
    tier: 'regular',
    description:
      'Centro universitario dedicado a la docencia e investigación de los estudios relacionados con la informática, las ciencias de la computación y las telecomunicaciones. Reconocido por su prestigio en la enseñanza de Ingeniería Informática, como mejor de España, sexta de Europa y entre las cincuenta mejores del mundo. ',
    logo: '/assets/participan/Color/Organismos/etsiit.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Universidad de Granada',
    links: [
      {
        rrss: 'Web',
        link: 'https://etsiit.ugr.es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/etsiit_ugr',
      },
    ],
  },
  {
    name: 'The Game Kitchen',
    tier: 'silver',
    description:
      'Estudio de desarrollo de videojuegos independiente de Sevilla. Especializados en títulos de aventura y acción con estética retro y temáticas inspiradas en el folclore andaluz. Son conocidos por juegos como “The Last Door” y “Blasphemous”.',
    logo: '/assets/participan/Color/Empresas/game-kitchen.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Desarrolladora de videojuegos',
    links: [
      {
        rrss: 'Web',
        link: 'https://thegamekitchen.com/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/the-game-kitchen/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/TheGameKitchen',
      },
    ],
  },
  {
    name: 'EMYCET',
    tier: 'bronze',
    description:
      'Agencia que se dedica a organizar circuitos, excursiones, viajes a medida y eventos, enfocándose en crear experiencias únicas y memorables para sus clientes. Su objetivo es inspirar a las personas a cumplir sus sueños a través del viaje y la diversión, promoviendo la felicidad y recuerdos inolvidables.',
    logo: '/assets/participan/Color/Empresas/emycet.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Viajes y eventos',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.emycet.com/',
      },
    ],
  },
  {
    name: 'TSTC',
    tier: 'silver',
    description:
      'El Departamento de Teoría de la Señal, Telemática y Comunicaciones (TSTC) de la Universidad de Granada fue creado en el curso 2004/2005, estando adscritas al mismo las áreas de conocimiento de Ingeniería Telemática (IT) y de Teoría de la Señal y Comunicaciones (TSC).',
    logo: '/assets/participan/Color/Organismos/logo-tstc.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Departamento de la UGR',
    links: [
      {
        rrss: 'Web',
        link: 'https://tstc.ugr.es/',
      },
    ],
  },
  {
    name: 'AESIT',
    tier: 'silver',
    description:
      'Nace en el año 2016 con el fin de fomentar y reforzar los lazos de los egresados con la ETSIIT. Realiza actividades de interés, colaborando y prestando apoyo a los estudiantes que están finalizando sus estudios y fomentar una buena convivencia en la escuela.',
    logo: '/assets/participan/Color/Organismos/aesit.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Asociación de Antiguos Estudiantes',
    links: [
      {
        rrss: 'Web',
        link: 'https://aesit.es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/aesit_ugr',
      },
    ],
  },
  {
    name: 'CSIRC',
    tier: 'regular',
    description:
      'Centro de Servicios de Informática y Redes de Comunicaciones de la Universidad de Granada. Tiene como misión desarrollar, mejorar y potenciar el uso de las Tecnologías de Información y Comunicación, dando soporte a la docencia, investigación y gestión de manera eficiente, e impulsando la innovación y la calidad de la UGR.',
    logo: '/assets/participan/Color/Organismos/csirc.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Universidad de Granada',
    links: [
      {
        rrss: 'Web',
        link: 'https://csirc.ugr.es/',
      },
    ],
  },
  {
    name: 'DGE',
    tier: 'regular',
    description:
      'La Delegación de Estudiantes es el órgano de representación de los estudiantes de la Universidad de Granada. Su función principal es la de representar a los estudiantes en los diferentes órganos de gobierno de la Universidad, así como en los diferentes foros y comisiones en los que se traten temas de interés para los estudiantes.',
    logo: '/assets/participan/Color/Organismos/dge.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Delegación de Estudiantes',
    links: [
      {
        rrss: 'Web',
        link: 'https://dge.ugr.es/',
      },
    ],
  },
  {
    name: 'DEIIT',
    tier: 'regular',
    description:
      'La Delegación de Estudiantes de Ingeniería Informática y Telecomunicaciones. Su función principal es la de representar a los estudiantes en los diferentes órganos de gobierno de la Universidad, así como en los diferentes foros y comisiones en los que se traten temas de interés para los estudiantes.',
    logo: '/assets/participan/Color/Organismos/deiit.png',
    cardBg: null,
    isSecret: true,
    bussiness: 'Delegación de Estudiantes',
    links: [
      {
        rrss: 'Web',
        link: 'https://deiit.ugr.es/',
      },
    ],
  },
];

export const sponsorsDiamond: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'diamond',
);

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
export const sponsorsRegular: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.tier === 'regular',
);

export const secretSponsor: SponsorData[] = Sponsors.filter(
  (sponsor) => sponsor.name === 'Patrocinador Secreto',
);
