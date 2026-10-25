// Public navigation destinations and common ways of asking for them.
export const searchPages = [
  {
    title: 'Voluntariado ULP 2027',
    description: 'Únete al equipo de voluntariado de la próxima UGR LAN Party.',
    href: '/#voluntariado',
    keywords:
      'voluntarios voluntario staff colaborar ayudar equipo organizacion montaje',
  },
  {
    title: 'Stands',
    description: 'Conoce los stands de la última edición de UGR LAN Party.',
    href: '/info/stands/',
    keywords:
      'stands expositores entidades deiit motril2047 mcdonalds geng iction game kitchen pokecrew',
  },
  {
    title: 'Inicio',
    description: 'La UGR LAN Party de un vistazo.',
    href: '/',
    keywords: 'home portada ulp',
  },
  {
    title: 'Horarios',
    description:
      'Consulta el programa y filtra las actividades por día, hora o juego.',
    href: '/info/horarios/',
    keywords: 'horario agenda programa calendario cuando fecha fechas horas',
  },
  {
    title: 'Mi agenda',
    description:
      'Tus actividades guardadas, exportación al calendario y agenda compartida.',
    href: '/info/horarios/#mi-agenda',
    keywords: 'favoritos guardar compartir qr calendario personal',
  },
  {
    title: 'Mapa y rutas',
    description:
      'Explora los edificios y encuentra rutas entre aulas y espacios de la ETSIIT.',
    href: '/info/mapa/#plano',
    keywords:
      'mapa planos aulario prefabricadas banos baños parking aparcamiento',
  },
  {
    title: 'Ediciones anteriores',
    description:
      'Nuestra historia: fotografías y recuerdos de las ediciones de la ULP.',
    href: '/info/ediciones_anteriores/',
    keywords:
      'historia memoria edicion ediciones anteriores pasadas antiguas fotos fotografias galeria',
  },
  {
    title: 'Edición 2026',
    description: 'Consulta el archivo de la ULP 2026.',
    href: '/ediciones/2026/',
    keywords: 'edicion anterior pasada archivo 2026',
  },
  {
    title: 'Sobre nosotros',
    description: 'Conoce la comunidad y el equipo de la UGR LAN Party.',
    href: '/info/about/',
    keywords:
      'quienes somos organizacion organizadores equipo universidad estudiantes etsiit',
  },
  {
    title: 'Localización',
    description: 'Dónde está la ETSIIT y cómo llegar al evento.',
    href: '/info/localizacion/',
    keywords: 'ubicacion direccion llegar transporte autobus granada mapa',
  },
  {
    title: 'Actividades',
    description:
      'Encuentra tu partida entre competiciones, retos y otras actividades.',
    href: '/actividades/',
    keywords: 'juegos torneos catalogo que hacer',
  },
  {
    title: 'Competiciones e inscripciones',
    description: 'Consulta los torneos y el estado de sus inscripciones.',
    href: '/actividades/#competiciones',
    keywords:
      'competicion competir inscripcion inscripciones apuntar apuntarme registro registrarse formulario forms',
  },
  {
    title: 'Retos',
    description: 'Descubre los desafíos de la ULP.',
    href: '/actividades/#retos',
    keywords: 'reto desafios pruebas',
  },
  {
    title: 'Juego libre',
    description: 'Un espacio para jugar y compartir partidas.',
    href: '/juego-libre/',
    keywords: 'jugar juegos libres lan',
  },
  {
    title: 'Participan',
    description:
      'Patrocinadores, partners y entidades que hacen posible la ULP.',
    href: '/participan/',
    keywords:
      'patrocinio patrocinar sponsor sponsors marcas patrocinadores colaboradores',
  },
  {
    title: 'Colaboradores',
    description: 'Colabora y forma parte del equipo de la ULP.',
    href: '/participan/colaboradores/',
    keywords: 'colaborar voluntariado voluntarios ayudar organizacion',
  },
  {
    title: 'Noticias',
    description: 'Novedades y publicaciones de la UGR LAN Party.',
    href: '/blog/',
    keywords: 'blog actualidad noticias novedades prensa',
  },
  {
    title: 'Prensa y colaboradores',
    description:
      'Logos de ULP, descripción breve, colores corporativos y contacto.',
    href: '/info/prensa/',
    keywords:
      'prensa medios logotipo logos identidad marca branding paleta colores hex recursos comunicación comunicacion kit colaboración colaboracion',
  },
  {
    title: 'Redes sociales',
    description:
      'Perfiles oficiales y evolución de seguidores de la ULP por edición.',
    href: '/info/rrss/',
    keywords:
      'redes sociales seguidores comunidad instagram twitter x discord twitch tiktok youtube facebook estadisticas',
  },
  {
    title: 'Contacto',
    description: 'Ponte en contacto con la organización de la ULP.',
    href: '/contacto/',
    keywords: 'contactar correo email mail escribir consulta prensa',
  },
  {
    title: 'Preguntas frecuentes',
    description: 'Resuelve tus dudas antes de venir a la ULP.',
    href: '/info/preguntas_frecuentes/',
    keywords: 'faq faqs ayuda dudas preguntas respuestas',
  },
  {
    title: 'Aviso legal',
    description: 'Información legal y privacidad de la web.',
    href: '/info/aviso_legal/',
    keywords: 'privacidad proteccion datos cookies condiciones',
  },
].map((page) => ({ ...page, kind: 'Sección' }));
