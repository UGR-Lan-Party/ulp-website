export const aularioFloors = [
  {
    level: 0,
    rooms: Array.from({ length: 8 }, (_, index) => `0.${index + 1}`),
    source:
      'https://etsiit.ugr.es/sites/centros/etsiit/public/inline-files/ETSIIT_Aulas_Teor%C3%ADa.pdf',
    description:
      'Aulas de teoría y servicios del núcleo circular. Distribución interpretada a partir del plano arquitectónico de 2013.',
    services: [
      { kind: 'stairs', label: 'Escaleras', x: 204, y: 310 },
      { kind: 'women', label: 'Aseo de mujeres', x: 275, y: 275 },
      { kind: 'men', label: 'Aseo de hombres', x: 275, y: 335 },
      { kind: 'lift', label: 'Ascensor', x: 250, y: 365 },
      { kind: 'entry', label: 'Acceso al Aulario', x: 240, y: 440 },
    ],
  },
  {
    level: 1,
    rooms: Array.from({ length: 8 }, (_, index) => `1.${index + 1}`),
    source:
      'https://etsiit.ugr.es/la-escuela/presentacion/instalaciones-servicios/biblioteca/estructura-equipamiento',
    description:
      'Aulas de teoría, aseos y paso al edificio principal según el plano publicado por la ETSIIT.',
    services: [
      { kind: 'wc', label: 'Aseos', x: 178, y: 477 },
      { kind: 'stairs', label: 'Escaleras', x: 178, y: 507 },
      { kind: 'entry', label: 'Paso al edificio principal', x: 482, y: 480 },
    ],
  },
] as const;
