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
    tier: '',
    logo: '/assets/participan/Logos/secretSponsor.webp',
    cardBg: '/assets/participan/BG-Sponsors/secretSponsor.webp',
    isSecret: false,
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
    logo: '/assets/participan/Logos/t-systems.webp',
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
    logo: '/assets/participan/Logos/geng.webp',
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
    logo: '/assets/participan/Logos/sidn.webp',
    cardBg: '/assets/participan/BG-Sponsors/sidn.webp',
    isSecret: true,
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
    name: 'Nacon España',
    tier: 'platinum',
    description:
      'Empresa líder en el sector del gaming, especializada en el diseño y distribución de accesorios premium para consolas y PC, así como en la edición de videojuegos. Nacon ofrece una amplia gama de productos enfocados en mejorar la experiencia y el rendimiento de los jugadores.',
    logo: '/assets/participan/Logos/nacon.webp',
    cardBg: '/assets/participan/BG-Sponsors/nacon.webp',
    isSecret: true,
    bussiness: 'Videojuegos y Accesorios Gaming',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.nacongaming.com/es-ES/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/nacon-gaming-españa/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/nacongamers_es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/nacongaminges',
      },
    ],
  },
  {
    name: 'LSI',
    tier: 'platinum',
    description:
      'Departamento de Lenguajes y Sistemas Informáticos de la Universidad. Fundado en 1989, imparte docencia en 20 grados y 15 másteres, en materias relacionadas con la ingeniería del software, sistemas operativos, metodologías de desarrollo, ingeniería web, sistemas gráficos, concurrentes, distribuidos, bases de datos...',
    logo: '/assets/participan/Logos/lsi.webp',
    cardBg: '/assets/participan/BG-Sponsors/lsi.webp',
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
    name: 'Cívica Software',
    tier: 'gold',
    description:
      'Empresa del sector tecnológico especializada en la implantación de estrategias de autoservicio, BI operacional, uso de tecnologías Big Data y arquitecturas federadas que simplifiquen la utilización de datos  a nivel corporativo con la mayor sencillez y fiabilidad.',
    logo: '/assets/participan/Logos/civica.webp',
    cardBg: '/assets/participan/BG-Sponsors/civica.webp',
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
    name: 'jtsec Beyond IT Security',
    tier: 'gold',
    description:
      'Laboratorio y consultora especializada en certificación de ciberseguridad y evaluaciones de productos IT. Expertos en estándares internacionales como Common Criteria, LINCE y normativas ENS, ayudan a sus clientes a garantizar que sus soluciones cumplen con los más altos niveles de seguridad.',
    logo: '/assets/participan/Logos/jtsec.webp',
    cardBg: '/assets/participan/BG-Sponsors/jtsec.webp',
    isSecret: true,
    bussiness: 'Ciberseguridad y Certificación',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.jtsec.es/es',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/jtsec/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/JTSecES',
      },
    ],
  },
  {
    name: 'GRANAJOVEN ',
    tier: 'gold',
    logo: '/assets/participan/Logos/concejalia-juventud.webp',
    cardBg: '/assets/participan/BG-Sponsors/granaJoven.webp',
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
    name: 'Wiber',
    tier: 'gold',
    description:
      'Operador de telecomunicaciones de proximidad que ofrece servicios de fibra óptica de alta velocidad, telefonía móvil, fija y televisión. La compañía se distingue por su trato humano y cercano, ofreciendo soluciones de conectividad con red propia y sin permanencia, adaptándose a las necesidades reales de sus clientes.',
    logo: '/assets/participan/Logos/wiber.webp',
    cardBg: '/assets/participan/BG-Sponsors/wiber.webp',
    isSecret: true,
    bussiness: 'Telecomunicaciones',
    links: [
      {
        rrss: 'Web',
        link: 'https://wiber.es/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/wiber-fibra/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/wiberfibra/',
      },
      {
        rrss: 'Facebook',
        link: 'https://www.facebook.com/wiberfibraoptica/',
      },
    ],
  },
  {
    name: 'AESIT',
    tier: 'silver',
    description:
      'Nace en el año 2016 con el fin de fomentar y reforzar los lazos de los egresados con la ETSIIT. Realiza actividades de interés, colaborando y prestando apoyo a los estudiantes que están finalizando sus estudios y fomentar una buena convivencia en la escuela.',
    logo: '/assets/participan/Logos/aesit.webp',
    cardBg: '/assets/participan/BG-Sponsors/aesit.webp',
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
    name: "McDonald's España",
    tier: 'silver',
    description:
      'Líder en el sector de la restauración en España, con más de 40 años de presencia en el país. La compañía se enfoca en ofrecer una experiencia de servicio rápido de alta calidad, basada en pilares de sostenibilidad, apoyo al producto local y un firme compromiso con la generación de empleo y la innovación en el servicio al cliente.',
    logo: '/assets/participan/Logos/mcdonals.webp',
    cardBg: '/assets/participan/BG-Sponsors/mcdonals.webp',
    isSecret: true,
    bussiness: 'Restauración y Hostelería',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.mcdonalds.es/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/mcdonalds_es/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/mcdonalds_es',
      },
    ],
  },
  {
    name: 'TSTC',
    tier: 'silver',
    description:
      'El Departamento de Teoría de la Señal, Telemática y Comunicaciones (TSTC) de la Universidad de Granada fue creado en el curso 2004/2005, estando adscritas al mismo las áreas de conocimiento de Ingeniería Telemática (IT) y de Teoría de la Señal y Comunicaciones (TSC).',
    logo: '/assets/participan/Logos/logo-tstc.webp',
    cardBg: '/assets/participan/BG-Sponsors/tstc.webp',
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
    name: 'DEIIT',
    tier: 'silver',
    description:
      'La Delegación de Estudiantes de Ingeniería Informática y Telecomunicaciones. Su función principal es la de representar a los estudiantes en los diferentes órganos de gobierno de la Universidad, así como en los diferentes foros y comisiones en los que se traten temas de interés para los estudiantes.',
    logo: '/assets/participan/Logos/deiit.webp',
    cardBg: '/assets/participan/BG-Sponsors/deiit.webp',
    isSecret: true,
    bussiness: 'Delegación de Estudiantes',
    links: [
      {
        rrss: 'Web',
        link: 'https://deiit.ugr.es/',
      },
    ],
  },
  {
    name: 'Mars Gaming',
    tier: 'silver',
    description:
      'Marca española referente en periféricos y componentes de hardware para videojuegos. Se especializa en productos con una relación calidad-precio competitiva, abarcando desde componentes y periféricos hasta mobiliario.',
    logo: '/assets/participan/Logos/marsGaming.webp',
    cardBg: '/assets/participan/BG-Sponsors/marsgaming.webp',
    isSecret: true,
    bussiness: 'Periféricos y Componentes Gaming',
    links: [
      {
        rrss: 'Web',
        link: 'https://marsgaming.eu/es/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/mars-gaming/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/marsgaming/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/MarsGaming_',
      },
    ],
  },
  {
    name: 'Llaveros Frikis',
    tier: 'silver',
    description:
      'Tienda online especializada en productos frikis impresos en 3D y encargos personalizados. Diseñamos y fabricamos llaveros y artículos únicos, combinando creatividad, calidad y producción propia para ofrecer regalos originales y totalmente personalizados.',
    logo: '/assets/participan/Logos/llaverosfrikis.webp',
    cardBg: '/assets/participan/BG-Sponsors/llaverosFrikis.webp',
    isSecret: true,
    bussiness: 'Tienda objetos 3D personalizados',
    links: [
      {
        rrss: 'Web',
        link: 'https://llaverosfrikis.com/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/llaverosfrikis_/',
      },
    ],
  },
  {
    name: 'Nazaríes Intelligenia',
    tier: 'silver',
    description:
      'Consultora tecnológica especializada en el desarrollo de software a medida y en el desarrollo de soluciones tecnológicas en el ámbito de la monitorización y sensorización.  Cuentan con más de 10 años de experiencia en desarrollo de software.',
    logo: '/assets/participan/Logos/nazaries.webp',
    cardBg: '/assets/participan/BG-Sponsors/nazaries.webp',
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
    name: 'The Game Kitchen',
    tier: 'silver',
    description:
      'Estudio de desarrollo de videojuegos independiente de Sevilla. Especializados en títulos de aventura y acción con estética retro y temáticas inspiradas en el folclore andaluz. Son conocidos por juegos como “The Last Door” y “Blasphemous”.',
    logo: '/assets/participan/Logos/game-kitchen.webp',
    cardBg: '/assets/participan/BG-Sponsors/theGameKitchen.webp',
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
    name: 'Fórmula Karting Granada',
    tier: 'bronze',
    description:
      'Destino predilecto para los aficionados al karting y la velocidad en Granada. Con instalaciones de primera línea diseñadas para ofrecer la máxima emoción y seguridad, este circuito para poner a prueba tanto a principiantes como a pilotos experimentados.',
    logo: '/assets/participan/Logos/formula-karting.webp',
    cardBg: '/assets/participan/BG-Sponsors/formulaKarting.webp',
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
    name: 'Iction Games',
    tier: 'bronze',
    description:
      'Estudio independiente de desarrollo de videojuegos con sede en Granada. Se dedican a la creación de experiencias interactivas de calidad, con un enfoque en títulos arcade y retro como "John Mambo", "Virtus" o "Viking Kingdoms", destacando por su compromiso con la comunidad de jugadores y la producción de ediciones coleccionista.',
    logo: '/assets/participan/Logos/ictionGames.webp',
    cardBg: '/assets/participan/BG-Sponsors/ictionGames.webp',
    isSecret: true,
    bussiness: 'Desarrollo de Videojuegos',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.ictiongames.com/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/ictiongames/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/IctionGames',
      },
    ],
  },
  {
    name: 'EMYCET',
    tier: 'bronze',
    description:
      'Agencia que se dedica a organizar circuitos, excursiones, viajes a medida y eventos, enfocándose en crear experiencias únicas y memorables para sus clientes. Su objetivo es inspirar a las personas a cumplir sus sueños a través del viaje y la diversión, promoviendo la felicidad y recuerdos inolvidables.',
    logo: '/assets/participan/Logos/emycet.webp',
    cardBg: '/assets/participan/BG-Sponsors/emycet.webp',
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
    name: 'GGTech Entertainment',
    tier: 'bronze',
    description:
      'Empresa tecnológica líder a nivel internacional especializada en proyectos vinculados a los videojuegos, la educación y los esports. Con presencia en múltiples continentes, GGTech destaca por la creación de IPs globales como UNIVERSITY Esports y la organización de grandes festivales como GAMERGY.',
    logo: '/assets/participan/Logos/ggtech.webp',
    cardBg: '/assets/participan/BG-Sponsors/ggtech.webp',
    isSecret: true,
    bussiness: 'Tecnología, Educación y Esports',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.ggtech.gg/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/ggtech_es',
      },
      {
        rrss: 'YouTube',
        link: 'https://www.youtube.com/@ggtechentertainment',
      },
    ],
  },
  {
    name: 'Bibliomaker',
    tier: 'bronze',
    description:
      'Servicio que ofrece espacios de colaboración destinados a la comunidad universitaria, en los que se ponen a disposición recursos, herramientas y maquinaria. En él cualquier persona o grupo de personas puede diseñar y construir proyectos, así como compartir recursos y conocimientos en proyectos creativos y de innovación.',
    logo: '/assets/participan/Logos/bibliomaker.webp',
    cardBg: '/assets/participan/BG-Sponsors/bibliomaker.webp',
    isSecret: true,
    bussiness: 'Sala de creación y fabricación',
    links: [
      {
        rrss: 'Web',
        link: 'https://biblioteca.ugr.es/servicios/espacios/bibliomaker',
      },
    ],
  },
  {
    name: 'Hackiit',
    tier: 'bronze',
    description:
      'Grupo de entusiastas del white hacking surgido en la Escuela Técnica Superior de Ingenierías Informática y de Telecomunicación (ETSIIT) de la Universidad de Granada. Promueven la ciberseguridad desde un enfoque ético y práctico, fomentando el aprendizaje continuo y el intercambio de conocimiento en seguridad informática.',
    logo: '/assets/participan/Logos/hackiit.webp',
    cardBg: '/assets/participan/BG-Sponsors/hackiit.webp',
    isSecret: true,
    bussiness: 'Sala de creación y fabricación',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.hackiit.org/',
      },
    ],
  },
  {
    name: 'UGR',
    tier: 'regular',
    description:
      'Universidad pública española con sede en Granada y con campus en las ciudades de Granada, Ceuta y Melilla. Reconocida como una de las 10 mejores universidades de España y entre las 500 mejores del mundo. Recibe cada año más de 2000 alumnos del programa Erasmus, siendo el destino europeo favorito.​',
    logo: '/assets/participan/Logos/ugr.webp',
    cardBg: '/assets/participan/BG-Sponsors/ugr.webp',
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
    logo: '/assets/participan/Logos/etsiit.webp',
    cardBg: '/assets/participan/BG-Sponsors/etsiit.webp',
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
    name: 'DGE',
    tier: 'regular',
    description:
      'La Delegación de Estudiantes es el órgano de representación de los estudiantes de la Universidad de Granada. Su función principal es la de representar a los estudiantes en los diferentes órganos de gobierno de la Universidad, así como en los diferentes foros y comisiones en los que se traten temas de interés para los estudiantes.',
    logo: '/assets/participan/Logos/dge.webp',
    cardBg: '/assets/participan/BG-Sponsors/dge.webp',
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
    name: 'Cafetería ETSIIT',
    tier: 'regular',
    description:
      'La cafetería de la Escuela Técnica Superior de Ingenierías Informática y de Telecomunicación (ETSIIT) de la Universidad de Granada es un espacio de encuentro para estudiantes, profesores y personal del centro. Ofrece una amplia variedad de alimentos y bebidas, creando un ambiente acogedor que complementa con la deliciosa paella de nuestro evento.',
    logo: '/assets/participan/Logos/cafeteria.webp',
    cardBg: '/assets/participan/BG-Sponsors/cafeteria.webp',
    isSecret: true,
    bussiness: 'Cafetería de la ETSIIT',
    links: [],
  },
  {
    name: 'AEVI',
    tier: 'regular',
    description:
      'La principal organización del sector del videojuego en España. Representa a toda la cadena de valor, desde desarrolladores y distribuidores hasta ligas de esports, defendiendo los intereses de la industria y promoviendo su desarrollo tecnológico y cultural.',
    logo: '/assets/participan/Logos/aevi.webp',
    cardBg: '/assets/participan/BG-Sponsors/aevi.webp',
    isSecret: true,
    bussiness: 'Asociación Sectorial',
    links: [
      {
        rrss: 'Web',
        link: 'https://aevi.org.es/',
      },
    ],
  },
  {
    name: 'Asociación Granada Tech',
    tier: 'regular',
    description:
      'Asociación que agrupa a las principales empresas del sector IT en Granada. Su objetivo es fomentar el ecosistema tecnológico local, impulsar la innovación y posicionar a la ciudad como un referente internacional en la economía digital.',
    logo: '/assets/participan/Logos/granadaTech.webp',
    cardBg: '/assets/participan/BG-Sponsors/granadaTech.webp',
    isSecret: true,
    bussiness: 'Asociación Tecnológica',
    links: [
      {
        rrss: 'Web',
        link: 'https://www.granadatech.org/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/granadatech',
      },
    ],
  },
  {
    name: 'Have Fun Gamers',
    tier: 'regular',
    description:
      'Agencia especializada en la creación de experiencias gaming y esports. Se dedican al diseño de espacios tecnológicos a medida, organización de eventos y actividades de team building, conectando marcas con la comunidad gamer a través de la formación y el entretenimiento.',
    logo: '/assets/participan/Logos/haveFunGamers.webp',
    cardBg: '/assets/participan/BG-Sponsors/haveFunGamers.webp',
    isSecret: true,
    bussiness: 'Eventos y Consultoría de Esports',
    links: [
      {
        rrss: 'Web',
        link: 'https://havefungamers.com/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/in/havefungamers/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/havefungamers',
      },
      {
        rrss: 'X',
        link: 'https://www.x.com/havefungamers/',
      },
    ],
  },
  {
    name: 'FEJUVES',
    tier: 'regular',
    description:
      'Federación nacional que representa y defiende los intereses de los jugadores de videojuegos y esports en España. Su objetivo es profesionalizar el sector, promover el juego responsable y fomentar la competición saludable a través de eventos y formación.',
    logo: '/assets/participan/Logos/fejuves.webp',
    cardBg: '/assets/participan/BG-Sponsors/fejuves.webp',
    isSecret: true,
    bussiness: 'Federación de Esports y Videojuegos',
    links: [
      {
        rrss: 'Web',
        link: 'https://fejuves.es/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/fejuves/',
      },
      {
        rrss: 'Instagram',
        link: 'https://www.instagram.com/fejuves/',
      },
      {
        rrss: 'X',
        link: 'https://twitter.com/FejuvES',
      },
    ],
  },
  {
    name: 'GDG Granada',
    tier: 'regular',
    description:
      'Comunidad local de desarrolladores respaldada por Google. Se dedica a compartir conocimientos sobre tecnología a través de charlas, talleres y eventos como el DevFest, fomentando la colaboración y el aprendizaje en el ecosistema tecnológico de Granada.',
    logo: '/assets/participan/Logos/gdg.webp',
    cardBg: '/assets/participan/BG-Sponsors/gdg.webp',
    isSecret: true,
    bussiness: 'Comunidad de Desarrolladores',
    links: [
      {
        rrss: 'Web',
        link: 'https://gdggranada.com/',
      },
      {
        rrss: 'LinkedIn',
        link: 'https://www.linkedin.com/company/gdg-granada/',
      },
      {
        rrss: 'X',
        link: 'https://x.com/GDGGranada',
      },
    ],
  },
  {
    name: 'DEFC',
    tier: 'regular',
    description:
      'Órgano de representación estudiantil de la Facultad de Ciencias de la UGR. Se encarga de canalizar las necesidades de los alumnos, dinamizar la vida universitaria mediante eventos y asegurar el cumplimiento de sus derechos académicos.',
    logo: '/assets/participan/Logos/defc.webp',
    cardBg: '/assets/participan/BG-Sponsors/defc.webp',
    isSecret: true,
    bussiness: 'Representación Estudiantil',
    links: [
      {
        rrss: 'Web',
        link: 'https://defc.ugr.es/',
      },
    ],
  },
  {
    name: 'RadioLab UGR',
    tier: 'regular',
    description:
      'Laboratorio de radio digital universitaria de la Universidad de Granada. Un espacio experimental y abierto que sirve como plataforma de comunicación para la comunidad académica y la ciudadanía, fomentando la divulgación científica y cultural.',
    logo: '/assets/participan/Logos/radioLab.webp',
    cardBg: '/assets/participan/BG-Sponsors/radiolab.webp',
    isSecret: true,
    bussiness: 'Radio y Medio de Comunicación UGR',
    links: [
      {
        rrss: 'Web',
        link: 'https://radiolab.ugr.es/',
      },
      {
        rrss: 'YouTube',
        link: 'https://www.youtube.com/playlist?list=PLbkFIGlP1fzkTxXMvJkHiFfxnuw_lg3fe',
      },
      {
        rrss: 'Facebook',
        link: 'https://www.facebook.com/people/RadioLab-UGR/100063936763508/',
      },
      {
        rrss: 'X',
        link: 'https://twitter.com/radiolabugr',
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
