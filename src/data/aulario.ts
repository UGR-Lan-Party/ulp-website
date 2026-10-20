import type { VenueAmenity } from './venue-amenities';

const upperBoundary = (x: number) => ((x - 23) * 1180) / 593;
const groundBoundaries = [200, 335, 470, 605, 740, 875, 1010];
const firstBoundaries = [108, 157, 243, 319, 389, 463, 527].map(upperBoundary);

export const aularioCore = {
  x: 315,
  y: 0,
  radius: 70,
  stairInnerRadius: 43,
  lift: { left: 86, right: 114, top: -26 },
} as const;

export const aularioGeometry = {
  perimeter: `M140 0H${aularioCore.x - aularioCore.radius}A${aularioCore.radius} ${aularioCore.radius} 0 0 1 ${aularioCore.x + aularioCore.radius} 0H${aularioCore.x + aularioCore.lift.left}V${aularioCore.lift.top}H${aularioCore.x + aularioCore.lift.right}V0H1040L1180 240H0Z`,
  columns: [
    ...groundBoundaries.flatMap((x) =>
      [55, 120, 185, 240].map((y) => ({ x, y })),
    ),
    { x: 108, y: 55 },
    { x: 70, y: 120 },
    { x: 32, y: 185 },
    { x: 60, y: 240 },
    { x: 1072, y: 55 },
    { x: 1110, y: 120 },
    { x: 1148, y: 185 },
    { x: 1120, y: 240 },
  ],
  stairs: [820, 955],
};

export function getAularioColumns(level: number) {
  return aularioGeometry.columns.filter(
    (column) =>
      level === 0 ||
      column.y === 55 ||
      column.y === 240 ||
      column.x <= 108 ||
      column.x >= 1072,
  );
}

export function getAularioRooms(level: number) {
  const divisions = level === 0 ? groundBoundaries : firstBoundaries;
  const edges = [60, ...divisions, 1120];
  return Array.from({ length: 8 }, (_, index) => {
    const left = edges[index];
    const right = edges[index + 1];
    const outline =
      index === 0
        ? `M108 55H${right}V214H60V185H32Z`
        : index === 7
          ? `M${left} 55H1072L1148 185H1120V214H${left}Z`
          : `M${left} 55H${right}V214H${left}Z`;
    return {
      number: `${level}.${8 - index}`,
      left,
      right,
      x: (left + right) / 2,
      y: 139,
      doorX:
        index === 0
          ? 151
          : level === 0 && index === 1
            ? 260
            : index === 7
              ? right - 65
              : right - 42,
      outline,
    };
  });
}

const coreServices: VenueAmenity[] = [
  { kind: 'men', label: 'Aseo de hombres', x: aularioCore.x + 33, y: -27 },
  { kind: 'women', label: 'Aseo de mujeres', x: aularioCore.x - 33, y: -27 },
  { kind: 'stairs', label: 'Escaleras', x: aularioCore.x, y: 23 },
  { kind: 'lift', label: 'Ascensor', x: aularioCore.x + 100, y: -13 },
];

export const aularioFloors = [
  {
    level: 0,
    rooms: getAularioRooms(0).map((room) => room.number),
    source:
      'https://etsiit.ugr.es/sites/centros/etsiit/public/inline-files/ETSIIT_Aulas_Teor%C3%ADa.pdf',
    services: [
      ...coreServices,
      { kind: 'entry', label: 'Acceso al Aulario', x: 458, y: 40 },
    ],
  },
  {
    level: 1,
    rooms: getAularioRooms(1).map((room) => room.number),
    source:
      'https://etsiit.ugr.es/la-escuela/presentacion/instalaciones-servicios/biblioteca/estructura-equipamiento',
    services: [
      ...coreServices,
      { kind: 'entry', label: 'Paso al edificio principal', x: 920, y: 18 },
    ],
  },
] as const;
