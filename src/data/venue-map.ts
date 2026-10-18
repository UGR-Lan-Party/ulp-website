export const venuePlans = [
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
] as const;

export type VenuePlanId = (typeof venuePlans)[number]['id'];
export type VenueOrientation = 0 | 1 | 2 | 3;

const mainPoint = (x: number, y: number) => ({
  x: 185 + x * 0.55,
  y: 110 + y * 0.55,
});
const roomPoint = (x: number, y: number) => ({
  x: 185 + x * 0.55,
  y: 178 + y * 0.55,
});

export const venueZones = [
  {
    id: 'hall',
    label: 'Hall principal',
    plan: 'principal-0',
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
    label: 'Entrada al patio',
    plan: 'principal-0',
    ...mainPoint(128, 365),
  },
  {
    id: 'estudiantes',
    label: 'Sala de estudiantes',
    plan: 'principal-baja',
    ...mainPoint(218, 112),
  },
  {
    id: 'actos',
    label: 'Salón de Actos',
    plan: 'principal-baja',
    ...mainPoint(520, 490),
  },
  {
    id: 'cafeteria',
    label: 'Cafetería',
    plan: 'principal-baja',
    ...mainPoint(735, 310),
  },
  {
    id: 'bajo-cafeteria',
    label: 'Bajo cafetería',
    plan: 'principal-baja',
    ...mainPoint(904, 440),
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
    ...roomPoint(245, 300),
  },
] as const;

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
      return { id: zone.id, x, y, side: x < 460 ? 'left' : 'right' };
    });
  return ['left', 'right'].flatMap((side) => {
    const group = points
      .filter((point) => point.side === side)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const positions = group.map((point) =>
      Math.max(72, Math.min(570, point.y - 20)),
    );
    for (let index = 1; index < positions.length; index++)
      positions[index] = Math.max(positions[index], positions[index - 1] + 58);
    for (let index = positions.length - 1; index >= 0; index--)
      positions[index] = Math.min(
        positions[index],
        index === positions.length - 1 ? 570 : positions[index + 1] - 58,
      );
    return group.map((point, index) => ({
      ...point,
      labelX: side === 'left' ? 12 : 748,
      labelY: positions[index],
      edgeX: side === 'left' ? 172 : 748,
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
  if (value.includes('estudiantes')) return ['estudiantes'];
  if (value.includes('grados')) return ['grados'];
  if (value.includes('salón de actos')) return ['actos'];
  if (value.includes('hall')) return ['hall'];
  if (value.includes('bajo de cafetería')) return ['bajo-cafeteria'];
  if (value.includes('cafetería')) return ['cafeteria'];
  if (value.includes('patio')) return ['patio'];
  return [];
}
