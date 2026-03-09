// ActivityTimeline.astro
// Itinerario con línea temporal animada — arquitectura sticky scroll + GSAP

export interface Activity {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  horario: { inicio: string; fin: string };
  aforo: string;
  imagenes: string[];
  color: string;
}

export const activities: Activity[] = [
  {
    nombre: 'Charla Coaching de GenG',
    ubicacion: 'Salón de Grados',
    descripcion:
      'Competición en formato doble eliminatoria. Hasta 64 jugadores se disputarán el trofeo ULP en las icónicas batallas del clásico de Nintendo. ¡Inscripción en el mostrador!',
    horario: { inicio: '15:45', fin: '17:00' },
    aforo: 'Aforo limitado a 30 personas.',
    imagenes: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
      'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=500&q=80',
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
    ],
    color: '#ff006e',
  },
  {
    nombre: 'Apertura & Bienvenida a ULP',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Inauguración oficial del evento ULP con palabras de los organizadores, presentación del programa del día y sorteo de merchandising exclusivo entre los asistentes.',
    horario: { inicio: '17:15', fin: '17:30' },
    aforo: 'Aforo limitado a 200 personas',
    imagenes: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
      'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=500&q=80',
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&q=80',
    ],
    color: '#00f5ff',
  },
  {
    nombre: 'Keynote The Game Kitchen, diseño de Videojuegos',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Taller práctico guiado por desarrolladores indie. Aprende a construir tu primer prototipo jugable en 90 minutos: físicas, sprites y lógica básica de juego.',
    horario: { inicio: '17:30', fin: '18:15' },
    aforo: 'Aforo limitado a 200 personas',
    imagenes: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
    ],
    color: '#8b5cf6',
  },
  {
    nombre: 'Charla De Fulanito de Copas',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Descansa, recarga pilas y sumérgete en nuestra colección de máquinas arcade originales: desde Pac-Man hasta Street Fighter II. Partidas gratuitas para todos los asistentes.',
    horario: { inicio: '18:15', fin: '19:00' },
    aforo: 'Aforo limitado a 200 personas',
    imagenes: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=500&q=80',
      'https://images.unsplash.com/photo-1531525727563-73d62a7503b3?w=500&q=80',
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80',
    ],
    color: '#f59e0b',
  },
  {
    nombre: 'Concierto de Música de Videojuegos con Orquesta Sinfónica',
    ubicacion: 'Salón de Actos de la ETSIIT',
    descripcion:
      'Charla magistral sobre cómo la inteligencia artificial está redefiniendo la narrativa, los NPCs y el diseño de niveles en títulos AAA. Mesa de preguntas al finalizar.',
    horario: { inicio: '19:00', fin: '20:00' },
    aforo: 'Aforo limitado a 200 personas',
    imagenes: [
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=500&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&q=80',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&q=80',
    ],
    color: '#10b981',
  },
];
