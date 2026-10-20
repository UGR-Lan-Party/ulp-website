export const venuePlans = [
  {
    id: 'recinto',
    building: 'recinto',
    buildingLabel: 'Vista General',
    floor: 'Recinto y exteriores',
  },
  {
    id: 'principal-0',
    building: 'principal',
    buildingLabel: 'Edificio Principal',
    floor: 'Planta 0',
  },
  {
    id: 'principal-baja',
    building: 'principal',
    buildingLabel: 'Edificio Principal',
    floor: 'Planta baja',
  },
  {
    id: 'aulario-0',
    building: 'aulario',
    buildingLabel: 'Edificio Aulario',
    floor: 'Planta 0',
  },
  {
    id: 'aulario-1',
    building: 'aulario',
    buildingLabel: 'Edificio Aulario',
    floor: 'Planta 1',
  },
  {
    id: 'aulas-inferiores',
    building: 'inferiores',
    buildingLabel: 'Aulas −1',
    floor: 'Aulas −1.1 y −1.2',
  },
  {
    id: 'prefabricadas-a',
    building: 'prefabricadas-a',
    buildingLabel: 'Prefabricadas A',
    floor: 'Aulas A1 y A2',
  },
  {
    id: 'prefabricadas-b',
    building: 'prefabricadas-b',
    buildingLabel: 'Prefabricadas B',
    floor: 'Aula B1',
  },
  {
    id: 'bancos-rojos',
    building: 'bancos-rojos',
    buildingLabel: 'Bancos rojos',
    floor: 'Zona de futbolín',
  },
  {
    id: 'bajo-exterior',
    building: 'recinto',
    buildingLabel: 'Vista General',
    floor: 'Bajo exterior · Ping pong',
    parent: 'recinto',
  },
  {
    id: 'principal-hall',
    building: 'principal',
    buildingLabel: 'Edificio Principal',
    floor: 'Hall principal',
    parent: 'principal-0',
  },
  {
    id: 'principal-actos',
    building: 'principal',
    buildingLabel: 'Edificio Principal',
    floor: 'Salón de Actos',
    parent: 'principal-baja',
  },
] as const;

export const selectableVenuePlans = venuePlans.filter(
  (plan) => !('parent' in plan),
);

export type VenuePlanId = (typeof venuePlans)[number]['id'];
export type VenueOrientation = 0 | 1 | 2 | 3;
export const initialVenuePlan: VenuePlanId = 'recinto';

export function getVenueInitialOrientation(
  plan: VenuePlanId,
): VenueOrientation {
  if (plan === 'aulario-0') return 1;
  if (plan === 'bancos-rojos') return 3;
  return plan === 'aulario-1' || plan === 'recinto' ? 2 : 0;
}

const mainPoint = (x: number, y: number) => ({
  x: 185 + x * 0.55,
  y: 110 + y * 0.55,
});
const roomPoint = (x: number, y: number) => ({
  x: 185 + x * 0.55,
  y: 178 + y * 0.55,
});

export const campusPoint = (x: number, y: number) => ({
  x: 190 + (x - 209) * 0.4,
  y: 152 + (y - 230) * 0.4,
});

const prefabAngle = (28 * Math.PI) / 180;
const prefabAnchor = { x: 462.25, y: 425.53 };
export const campusPrefabs = [
  { id: 'a', ...prefabAnchor },
  {
    id: 'b',
    x: prefabAnchor.x - 266 * Math.sin(prefabAngle),
    y: prefabAnchor.y + 266 * Math.cos(prefabAngle),
  },
] as const;

const prefabPoint = (id: 'a' | 'b') => {
  const module = campusPrefabs.find((module) => module.id === id)!;
  return campusPoint(
    module.x + 42.5 * Math.cos(prefabAngle) - 45 * Math.sin(prefabAngle),
    module.y + 42.5 * Math.sin(prefabAngle) + 45 * Math.cos(prefabAngle),
  );
};

export const venueZones = [
  {
    id: 'parking',
    label: 'Parking',
    plan: 'recinto',
    informational: true,
    ...campusPoint(245, 1110),
  },
  {
    id: 'campus-principal',
    label: 'Edificio Principal',
    plan: 'recinto',
    informational: true,
    openPlan: 'principal-0',
    ...campusPoint(1190, 600),
  },
  {
    id: 'campus-aulario',
    label: 'Aulario',
    plan: 'recinto',
    informational: true,
    openPlan: 'aulario-0',
    ...campusPoint(1050, 1100),
  },
  {
    id: 'campus-inferiores',
    label: 'Aulas −1',
    plan: 'recinto',
    informational: true,
    openPlan: 'aulas-inferiores',
    ...campusPoint(990, 465),
  },
  {
    id: 'campus-prefabricadas-a',
    label: 'Prefabricadas A',
    plan: 'recinto',
    informational: true,
    openPlan: 'prefabricadas-a',
    ...prefabPoint('a'),
  },
  {
    id: 'campus-prefabricadas-b',
    label: 'Prefabricada B',
    plan: 'recinto',
    informational: true,
    openPlan: 'prefabricadas-b',
    ...prefabPoint('b'),
  },
  {
    id: 'campus-bancos',
    label: 'Bancos rojos · Futbolín',
    plan: 'recinto',
    informational: true,
    openPlan: 'bancos-rojos',
    ...campusPoint(955, 430),
  },
  {
    id: 'acceso-principal',
    label: 'Acceso principal',
    plan: 'principal-0',
    informational: true,
    ...mainPoint(360, 100),
  },
  {
    id: 'conserjeria',
    label: 'Conserjería',
    plan: 'principal-0',
    informational: true,
    ...mainPoint(535, 185),
  },
  {
    id: 'secretaria',
    label: 'Secretaría',
    plan: 'principal-0',
    informational: true,
    ...mainPoint(650, 745),
  },
  {
    id: 'streaming',
    label: 'Sala de streaming',
    plan: 'principal-0',
    informational: true,
    ...mainPoint(200, 585),
  },
  {
    id: 'terraza-cafeteria',
    label: 'Terraza',
    plan: 'principal-baja',
    informational: true,
    ...mainPoint(950, 370),
  },
  {
    id: 'bancos-rojos',
    label: 'Bancos rojos',
    plan: 'bancos-rojos',
    x: 460,
    y: 365,
  },
  {
    id: 'campus-pingpong',
    label: 'Bajo exterior · Ping pong',
    plan: 'recinto',
    informational: true,
    openPlan: 'bajo-exterior',
    ...campusPoint(1120, 905),
  },
  {
    id: 'bajo-exterior',
    label: 'Ping pong',
    plan: 'bajo-exterior',
    x: 525,
    y: 350,
  },
  {
    id: 'terraza',
    informational: true,
    label: 'Terraza',
    plan: 'recinto',
    ...campusPoint(1410, 710),
  },
  {
    id: 'hall',
    label: 'Hall principal',
    plan: 'principal-0',
    openPlan: 'principal-hall',
    ...mainPoint(535, 485),
  },
  {
    id: 'grados',
    label: 'Salón de Grados',
    plan: 'principal-0',
    ...mainPoint(195, 735),
  },
  {
    id: 'patio',
    informational: true,
    label: 'Entrada al patio',
    plan: 'principal-0',
    ...mainPoint(128, 365),
  },
  {
    id: 'profesores-externos',
    label: 'Sala de Profesores Externos',
    plan: 'principal-baja',
    ...mainPoint(510, 165),
  },
  {
    id: 'estudiantes',
    label: 'Sala de estudiantes',
    plan: 'principal-baja',
    ...mainPoint(254.55, 155.12),
  },
  {
    id: 'actos',
    label: 'Salón de Actos',
    plan: 'principal-baja',
    openPlan: 'principal-actos',
    ...mainPoint(520, 490),
  },
  {
    id: 'cafeteria',
    label: 'Cafetería',
    plan: 'principal-baja',
    ...mainPoint(735, 310),
  },
  {
    id: 'aula11',
    label: 'Aula −1.1',
    plan: 'aulas-inferiores',
    ...roomPoint(240, 300),
  },
  {
    id: 'aula12',
    label: 'Aula −1.2',
    plan: 'aulas-inferiores',
    ...roomPoint(750, 300),
  },
  {
    id: 'a1',
    label: 'Prefabricada A1',
    plan: 'prefabricadas-a',
    ...roomPoint(245, 300),
  },
  {
    id: 'a2',
    label: 'Prefabricada A2',
    plan: 'prefabricadas-a',
    ...roomPoint(755, 300),
  },
  {
    id: 'b1',
    label: 'Prefabricada B1',
    plan: 'prefabricadas-b',
    x: 460,
    y: 350,
  },
] as const;

export function isVenueInformation(id: string) {
  return venueZones.some(
    (zone) => zone.id === id && 'informational' in zone && zone.informational,
  );
}

function getVenueLabelPositions(points: { y: number }[]) {
  const blocks: { total: number; count: number }[] = [];
  points.forEach((point, index) => {
    blocks.push({ total: point.y - 20 - index * 58, count: 1 });
    while (blocks.length > 1) {
      const current = blocks[blocks.length - 1];
      const previous = blocks[blocks.length - 2];
      if (previous.total / previous.count <= current.total / current.count)
        break;
      previous.total += current.total;
      previous.count += current.count;
      blocks.pop();
    }
  });
  return blocks
    .flatMap((block) =>
      Array<number>(block.count).fill(
        Math.max(
          72,
          Math.min(570 - 58 * (points.length - 1), block.total / block.count),
        ),
      ),
    )
    .map((position, index) => position + index * 58);
}

export function getVenueLayout(
  plan: VenuePlanId,
  orientation: VenueOrientation,
) {
  const turns = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  const [cos, sin] = turns[orientation];
  const points = venueZones
    .filter((zone) => zone.plan === plan)
    .map((zone) => {
      const dx = zone.x - 460;
      const dy = zone.y - 350;
      const x = 460 + dx * cos - dy * sin;
      const y = 350 + dx * sin + dy * cos;
      const side =
        zone.id === 'profesores-externos' && orientation === 0
          ? 'top'
          : plan === 'principal-baja' &&
              orientation === 0 &&
              zone.id === 'actos'
            ? 'left'
            : x < 460
              ? 'left'
              : 'right';
      return { id: zone.id, x, y, side };
    });
  return ['left', 'right', 'top'].flatMap((side) => {
    const group = points
      .filter((point) => point.side === side)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const positions = getVenueLabelPositions(group);
    return group.map((point, index) => ({
      ...point,
      labelX: side === 'top' ? point.x - 80 : side === 'left' ? 12 : 748,
      labelY: side === 'top' ? point.y - 110 : positions[index],
      edgeX: side === 'top' ? point.x : side === 'left' ? 172 : 748,
      edgeY: side === 'top' ? point.y - 70 : positions[index] + 20,
    }));
  });
}

export const venueLayouts = Object.fromEntries(
  venuePlans.map((plan) => [
    plan.id,
    [0, 1, 2, 3].map((orientation) =>
      getVenueLayout(plan.id, orientation as VenueOrientation),
    ),
  ]),
);

export function getVenueZones(location: string): string[] {
  const value = location.toLocaleLowerCase('es');
  if (value.includes('prefabricad'))
    return ['a1', 'a2', 'b1'].filter((id) => value.includes(id));
  if (value.includes('aula') && value.includes('-1.'))
    return ['aula11', 'aula12'].filter((id) =>
      value.includes(id === 'aula11' ? '-1.1' : '-1.2'),
    );
  if (value.includes('bancos rojos')) return ['bancos-rojos'];
  if (value.includes('bajo exterior')) return ['bajo-exterior'];
  if (value.includes('terraza')) return ['terraza'];
  if (value.includes('profesores externos')) return ['profesores-externos'];
  if (value.includes('estudiantes')) return ['estudiantes'];
  if (value.includes('grados')) return ['grados'];
  if (value.includes('salón de actos')) return ['actos'];
  if (value.includes('hall')) return ['hall'];
  if (value.includes('bajo de cafetería')) return [];
  if (value.includes('cafetería')) return ['cafeteria'];
  if (value.includes('patio')) return ['patio'];
  return [];
}
