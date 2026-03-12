// ActivityTimeline.astro
// Itinerario con línea temporal animada — arquitectura sticky scroll + GSAP
import type { RRSSLink } from '../data/sponsors.ts';
export interface Activity {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  horario: { inicio: string; fin: string };
  logo: string;
  ponentes: {
    nombre: string;
    role: string;
    links: RRSSLink[];
    image: string;
  }[];
  aforo: string;
  imagenes: string[];
  color: string;
}

export const activities: Activity[] = [
  {
    nombre: 'Esports Masterclass - GenG Global Academy',
    ubicacion: 'Salón de Grados',
    descripcion: `¿Alguna vez te has planteado trabajar dentro del mundo de los eSports? Asiste a esta masterclass y consigue merchandising exclusivo del legendario equipo GenG Esports!  
                  <br />
                  Plazas limitadas — Regístrate en <a href="https://forms.gle/NNWwe8QFkVwG6NNn8" style="color: #AA8A00; text-decoration: underline;">este formulario</a>.`,
    horario: { inicio: '15:45', fin: '16:30' },
    logo: '/assets/participan/Logos/geng.webp',
    ponentes: [
      {
        nombre: 'Patrick Daley',
        role: 'Esports People/Projects Guy. Esports Management MBA.',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/pat-daley2020/',
          },
        ],
        image: '/assets/activities/patrick-daley.webp',
      },
    ],
    aforo: '60',
    imagenes: ['/assets/activities/geng.jpg'],
    color: '#AA8A00',
  },
  {
    nombre: 'Bienvenida del subdirector de la ETSIIT',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Palabras de bienvenida a cargo del subdirector de la ETSIIT, Juan José Ramos, quien nos dará la bienvenida oficial al evento y compartirá unas palabras sobre la importancia de la tecnología, los videojuegos y la cultura gamer en el ámbito académico y profesional.',
    horario: { inicio: '17:00', fin: '17:15' },
    logo: '/assets/participan/Logos/etsiit.webp',
    ponentes: [
      {
        nombre: 'Juan José Ramos',
        role: 'Subdirector de la ETSIIT',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/juan-jos%C3%A9-ramos-mu%C3%B1oz-782391367/',
          },
        ],
        image: '/assets/activities/juan-jose-ramos-munoz.webp',
      },
    ],
    aforo: '196',
    imagenes: ['/assets/activities/etsiit.webp'],
    color: '#D06113',
  },
  {
    nombre: 'Presentación de la UGR LAN Party 8ª Ed.',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Inauguración oficial del evento ULP con palabras de los organizadores, presentación del programa del día y sorteo de merchandising exclusivo entre los asistentes.',
    horario: { inicio: '17:15', fin: '17:30' },
    logo: '/assets/logo/logo-black.png',
    ponentes: [
      {
        nombre: 'Mario Castro',
        role: 'Organizador Principal de UGR LAN Party',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/mario-castro-almenzar/',
          },
        ],
        image: '/assets/activities/mario-castro.webp',
      },
      {
        nombre: 'Marcelino Cabrera',
        role: 'Organizador Principal de UGR LAN Party',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/marcelinocabrera/',
          },
        ],
        image: '/assets/team/team03.jpeg',
      },
      {
        nombre: 'Antonio Mora',
        role: 'Organizador Principal de UGR LAN Party',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/antoniomora/',
          },
        ],
        image: '/assets/team/team01.jpeg',
      },
    ],
    aforo: '196',
    imagenes: ['/assets/activities/Cartel-ULP-2026.png'],
    color: '#00f5ff',
  },
  {
    nombre:
      'Del gamer al cliente: cómo la IA está cambiando las reglas del marketing',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'En esta sesión exploraremos cómo las mismas lógicas que hacen tan adictivos a los videojuegos, personalización, progresión, recompensas y eventos en vivo, se están trasladando al marketing gracias a la inteligencia artificial, convirtiendo al "gamer" en "cliente" sin que casi lo note. Veremos cómo la IA analiza el comportamiento de jugadores y usuarios para tomar decisiones en tiempo real (qué mostrar, cuándo, a quién y con qué incentivo), cómo las marcas están implementando las técnicas del gaming para diseñar campañas que se "juegan" y no solo se ven, y qué oportunidades se abren para las compañías que integran IA, marketing y cultura gamer en una misma estrategia.',
    horario: { inicio: '17:30', fin: '18:15' },
    logo: '/assets/participan/Logos/sidn.webp',
    ponentes: [
      {
        nombre: 'Isabel Vázquez',
        role: 'AI Solutions Manager en SIDN',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/isabelvazquezsalmeron/',
          },
        ],
        image: '/assets/activities/isabel-vazquez.webp',
      },
    ],
    aforo: '196',
    imagenes: [
      '/assets/activities/isabel-1.jpeg',
      '/assets/activities/isabel-2.jpeg',
    ],
    color: '#ED602D',
  },
  {
    nombre: 'Llaves, candados y "ya volveré luego"',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      '¿Cómo se diseña un mundo lleno de puertas cerradas, atajos y lugares a los que volver más tarde? En esta charla recorreremos el diseño de mundos metroidvania desde su estructura más amplia hasta los pequeños momentos que definen la experiencia del jugador.',
    horario: { inicio: '18:15', fin: '19:00' },
    logo: '/assets/participan/Logos/game-kitchen.webp',
    ponentes: [
      {
        nombre: 'Alberto Portero',
        role: 'Diseñador de niveles 2D y metroidvania.',
        links: [
          {
            rrss: 'LinkedIn',
            link: 'https://www.linkedin.com/in/johndoe',
          },
        ],
        image: '/assets/activities/alberto-portero.webp',
      },
    ],
    aforo: '196',
    imagenes: [
      '/assets/activities/game-kitchen-1.jpeg',
      '/assets/activities/game-kitchen-2.jpg',
    ],
    color: '#8b5cf6',
  },
  {
    nombre: 'Concierto de Música de Videojuegos con Orquesta Virtual Sound',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Orquesta Virtual Sound es una orquesta sinfónica virtual especializada en la interpretación de música de videojuegos. En este concierto, nos deleitarán con una selección de piezas icónicas de la historia de los videojuegos. Desde las melodías épicas de los RPG hasta los temas más dinámicos de los juegos de acción, esta experiencia musical promete transportar a los asistentes a través de un viaje sonoro lleno de nostalgia y pasión por el mundo gamer.',
    horario: { inicio: '19:00', fin: '20:00' },
    logo: '/assets/activities/orquesta-virtual-sound.webp',
    ponentes: [
      {
        nombre: 'Orquesta Virtual Sound',
        role: 'Orquesta de Música de Videojuegos',
        links: [
          {
            rrss: 'TikTok',
            link: 'https://www.tiktok.com/@orquestavs',
          },
        ],
        image: '/assets/activities/orquesta-virtual-sound.webp',
      },
    ],
    aforo: '196',
    imagenes: [
      '/assets/activities/orquesta-1.jpeg',
      '/assets/activities/concierto-cartel.jpg',
    ],
    color: '#10b981',
  },
  {
    nombre: 'Despedida & Sorteos',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Agradecimiento a los asistentes, ponentes y colaboradores por su participación en la ULP 2026. Sorteo de merchandising exclusivo entre los asistentes. Con sorpresas y pistas para el día siguiente...',
    horario: { inicio: '20:00', fin: '20:30' },
    logo: '/assets/logo/logo-black.png',
    ponentes: [],
    aforo: '196',
    imagenes: ['/assets/activities/sorteos-1.jpg'],
    color: '#f59e0b',
  },
];
