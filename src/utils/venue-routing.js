import {
  getAularioRooms,
  getAularioMapPoint,
  aularioEntrances,
} from '../data/aulario.ts';
import { campusPoint, campusPrefabs } from '../data/venue-map.ts';

export const routeNodes = [];
export const routeEdges = [];
export const routeLocations = [];
const node = (id, plan, x, y) => {
  routeNodes.push({ id, plan, x, y });
  return id;
};
const edge = (from, to, options = {}) =>
  routeEdges.push({ from, to, kind: 'walk', ...options });
const location = (id, label, category, at) =>
  routeLocations.push({ id, label, category, node: at });
const main = (plan, x, y) => ({ plan, x: 185 + x * 0.55, y: 110 + y * 0.55 });
const addMain = (id, plan, x, y) => {
  const p = main(plan, x, y);
  return node(id, p.plan, p.x, p.y);
};
function chain(ids, options) {
  ids.slice(1).forEach((id, index) => edge(ids[index], id, options));
}
for (const [plan, short] of [
  ['principal-0', 'p0'],
  ['principal-baja', 'pb'],
]) {
  addMain(`${short}-core`, plan, 300, 324);
  addMain(`${short}-stair-exit`, plan, 245, 335);
  addMain(`${short}-stair-turn`, plan, 217, 335);
  addMain(`${short}-stairs`, plan, 217, 321);
  chain([
    `${short}-core`,
    `${short}-stair-exit`,
    `${short}-stair-turn`,
    `${short}-stairs`,
  ]);
}
edge('p0-stairs', 'pb-stairs', { kind: 'stairs', cost: 30 });
addMain('hall', 'principal-0', 450, 365);
edge('p0-core', 'hall');
location('hall', 'Hall principal', 'Edificio Principal · Planta 0', 'hall');
addMain('p0-west', 'principal-0', 292, 400);
edge('p0-core', 'p0-west');
edge('hall', 'p0-west');
let previous = 'p0-west';
for (const [id, label, y] of [
  ['sala-juntas', 'Sala de juntas', 529],
  ['streaming', 'Sala de streaming', 565],
  ['grados', 'Salón de Grados', 679],
]) {
  addMain(`${id}-corridor`, 'principal-0', 292, y);
  edge(previous, `${id}-corridor`);
  previous = `${id}-corridor`;
  addMain(id, 'principal-0', 276, y);
  edge(`${id}-corridor`, id);
  location(id, label, 'Edificio Principal · Planta 0', id);
}
addMain('p0-secretaria-turn', 'principal-0', 520, 550);
edge('hall', 'p0-secretaria-turn');
addMain('secretaria', 'principal-0', 670, 582);
edge('p0-secretaria-turn', 'secretaria');
location(
  'secretaria',
  'Secretaría',
  'Edificio Principal · Planta 0',
  'secretaria',
);
addMain('patio', 'principal-0', 156, 365);
addMain('patio-turn', 'principal-0', 230, 365);
chain(['p0-west', 'patio-turn', 'patio']);
edge('hall', 'patio-turn');
location('patio', 'Entrada al patio', 'Edificio Principal · Planta 0', 'patio');
addMain('pb-north', 'principal-baja', 350, 280);
edge('pb-core', 'pb-north');
addMain('pb-student-turn', 'principal-baja', 350, 160);
edge('pb-north', 'pb-student-turn');
addMain('estudiantes', 'principal-baja', 311, 136);
edge('pb-student-turn', 'estudiantes');
location(
  'estudiantes',
  'Sala de estudiantes',
  'Edificio Principal · Planta baja',
  'estudiantes',
);
addMain('inferiores-entry', 'principal-baja', 345, 115);
edge('pb-student-turn', 'inferiores-entry');
addMain('pb-cafe-corridor', 'principal-baja', 540, 303);
addMain('pb-prof-corridor', 'principal-baja', 540, 255);
edge('pb-cafe-corridor', 'pb-prof-corridor');
for (const corridor of ['pb-cafe-corridor', 'pb-prof-corridor']) {
  edge('pb-core', corridor);
  edge('pb-north', corridor);
}
for (const [id, label, x, y, access] of [
  ['actos', 'Salón de Actos', 373.5, 377.5, 'pb-core'],
  ['cafeteria', 'Cafetería', 559, 303, 'pb-cafe-corridor'],
  [
    'profesores-externos',
    'Sala de Profesores Externos',
    559,
    255,
    'pb-prof-corridor',
  ],
]) {
  addMain(id, 'principal-baja', x, y);
  edge(access, id);
  location(id, label, 'Edificio Principal · Planta baja', id);
}
node('lower-corridor', 'aulas-inferiores', 185 + 552 * 0.48, 178 + 670 * 0.48);
edge('inferiores-entry', 'lower-corridor', {
  kind: 'connection',
});
for (const [id, label, path] of [
  [
    'aula11',
    'Aula −1.1',
    [
      [552, 670],
      [552, 606],
      [514, 606],
    ],
  ],
  [
    'aula12',
    'Aula −1.2',
    [
      [552, 670],
      [880, 670],
      [880, 646],
    ],
  ],
]) {
  let from = 'lower-corridor';
  path.slice(1).forEach(([x, y], i) => {
    const next = node(
      `${id}-${i}`,
      'aulas-inferiores',
      185 + x * 0.48,
      178 + y * 0.48,
    );
    edge(from, next);
    from = next;
  });
  location(id, label, 'Aulas −1', from);
}
for (const level of [0, 1]) {
  const plan = `aulario-${level}`;
  const add = (id, x, y) => {
    const p = getAularioMapPoint(level, x, y);
    return node(id, plan, p.x, p.y);
  };
  add(`a${level}-core`, 415, 28);
  add(`a${level}-stairs`, 315, 23);
  add(`a${level}-stair-approach`, 315, 28);
  edge(`a${level}-stair-approach`, `a${level}-stairs`);
  const rooms = getAularioRooms(level).sort((a, b) => a.doorX - b.doorX);
  const corridor = rooms.map((room) => ({
    room,
    id: add(`a${level}-corridor-${room.number}`, room.doorX, 28),
  }));
  const junctions = [
    ...corridor.map((item) => ({ x: item.room.doorX, id: item.id })),
    { x: 415, id: `a${level}-core` },
    { x: 315, id: `a${level}-stair-approach` },
    ...(level === 0
      ? aularioEntrances.map((entry) => ({
          x: entry.x,
          id: add(`${entry.id}-approach`, entry.x, 28),
        }))
      : []),
  ].sort((a, b) => a.x - b.x);
  chain(junctions.map((item) => item.id));
  for (const { room, id } of corridor) {
    const door = add(`room-${room.number}`, room.doorX, 55);
    edge(id, door);
    location(
      `aulario-${room.number}`,
      `Aula ${room.number}`,
      `Aulario · Planta ${level}`,
      door,
    );
  }
  if (level === 0)
    for (const entry of aularioEntrances) {
      add(entry.id, entry.x, entry.y);
      edge(`${entry.id}-approach`, entry.id);
      location(
        entry.id,
        `${entry.label} del Aulario`,
        'Aulario · Planta 0',
        entry.id,
      );
    }
}
edge('a0-stairs', 'a1-stairs', { kind: 'stairs', cost: 30 });
const campus = (id, x, y) => {
  const p = campusPoint(x, y);
  return node(id, 'recinto', p.x, p.y);
};
campus('outside-principal', 930, 580);
campus('covered-turn', 1195, 945);
campus('patio-corner', aularioEntrances[0].campusX, 580);
const mainEntrance = aularioEntrances[0];
campus('outside-aulario', mainEntrance.campusX, mainEntrance.campusY);
campus('aulario-main-approach', mainEntrance.campusX, 945);
chain(
  [
    'outside-principal',
    'patio-corner',
    'aulario-main-approach',
    'outside-aulario',
  ],
  {
    kind: 'outside',
  },
);
edge('patio', 'outside-principal', {
  kind: 'connection',
});
edge('outside-aulario', 'aulario-entry', {
  kind: 'connection',
});
campus('campus-west', 977, 945);
edge('covered-turn', 'campus-west', { kind: 'outside' });
chain(['campus-west', 'aulario-main-approach', 'outside-aulario'], {
  kind: 'outside',
});
campus('campus-benches', 977, 420);
campus('benches-corner', mainEntrance.campusX, 420);
chain(['patio-corner', 'benches-corner', 'campus-benches'], {
  kind: 'outside',
});
location(
  'bancos-rojos',
  'Bancos rojos · Futbolín',
  'Recinto y exteriores',
  'campus-benches',
);
campus('campus-ping', 1120, 905);
edge('covered-turn', 'campus-ping', { kind: 'outside' });
location(
  'ping-pong',
  'Bajo exterior · Ping pong',
  'Recinto y exteriores',
  'campus-ping',
);
campus('prefab-walkway', 600, 950);
edge('campus-west', 'prefab-walkway', {
  kind: 'outside',
});
for (const module of campusPrefabs) {
  const radians = (28 * Math.PI) / 180;
  const x = module.x + 85 * Math.cos(radians) - 105 * Math.sin(radians),
    y = module.y + 85 * Math.sin(radians) + 105 * Math.cos(radians);
  campus(`outside-prefab-${module.id}`, x, y);
  edge('prefab-walkway', `outside-prefab-${module.id}`, {
    kind: 'outside',
  });
  const plan = `prefabricadas-${module.id}`;
  const positions =
    module.id === 'a'
      ? [
          ['a1', 170],
          ['a2', 680],
        ]
      : [['b1', 368]];
  for (const [id, entryX] of positions) {
    const p =
      module.id === 'b'
        ? { x: 460 + (entryX - 245) * 0.55, y: 350 + (585 - 312.5) * 0.55 }
        : { x: 185 + entryX * 0.55, y: 178 + 585 * 0.55 };
    node(id, plan, p.x, p.y);
    edge(`outside-prefab-${module.id}`, id, {
      kind: 'connection',
    });
    location(id, `Prefabricada ${id.toUpperCase()}`, 'Prefabricadas', id);
  }
}

export function findVenueRoute(origin, destination) {
  const start = routeLocations.find((item) => item.id === origin),
    end = routeLocations.find((item) => item.id === destination);
  if (!start || !end || origin === destination) return null;
  const byId = new Map(
    routeNodes
      .filter(
        (item) =>
          !unavailableRouteDoors.some(
            (door) =>
              door.plan === item.plan &&
              Math.hypot(door.x - item.x, door.y - item.y) < 1,
          ),
      )
      .map((item) => [item.id, item]),
  );
  if (!byId.has(start.node) || !byId.has(end.node)) return null;
  const distances = new Map([[start.node, 0]]),
    previous = new Map(),
    remaining = new Set(byId.keys());
  while (remaining.size) {
    const current = [...remaining].reduce((a, b) =>
      (distances.get(a) ?? Infinity) < (distances.get(b) ?? Infinity) ? a : b,
    );
    if (!Number.isFinite(distances.get(current) ?? Infinity)) break;
    if (current === end.node) break;
    remaining.delete(current);
    for (const link of routeEdges) {
      const next =
        link.from === current
          ? link.to
          : link.to === current
            ? link.from
            : null;
      if (!next || !remaining.has(next)) continue;
      const a = byId.get(current),
        b = byId.get(next);
      const distance =
        distances.get(current) +
        (link.cost ?? Math.hypot(a.x - b.x, a.y - b.y) + 1);
      if (distance < (distances.get(next) ?? Infinity)) {
        distances.set(next, distance);
        previous.set(next, { id: current, edge: link });
      }
    }
  }
  if (!previous.has(end.node)) return null;
  const ids = [end.node],
    links = [];
  let cursor = end.node;
  while (cursor !== start.node) {
    const step = previous.get(cursor);
    links.unshift(step.edge);
    cursor = step.id;
    ids.unshift(cursor);
  }
  let segments = [];
  ids.forEach((id, index) => {
    const point = byId.get(id);
    let segment = segments.at(-1);
    if (!segment || segment.plan !== point.plan) {
      segment = {
        plan: point.plan,
        points: [],
        transition: index ? links[index - 1].kind : null,
      };
      segments.push(segment);
    }
    segment.points.push({ x: point.x, y: point.y });
  });
  const overviewPoints = ids.flatMap((id) => {
    const point = byId.get(id);
    return point.plan === 'recinto' ? [{ x: point.x, y: point.y }] : [];
  });
  for (const segment of segments) {
    if (segment.plan !== 'recinto') continue;
    const last = segment.points.at(-1),
      entry = byId.get('outside-aulario');
    if (last.x === entry.x && last.y === entry.y)
      segment.arrival = 'Entrada principal del Aulario';
  }
  return {
    overviewPoints,
    origin: start,
    destination: end,
    segments,
  };
}

export const unavailableRouteDoors = [
  { id: 'grados-auxiliar', ...main('principal-0', 218, 850) },
];

export function simplifyVenueRoutePoints(points) {
  const result = [];
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    const previous = result.at(-1);
    if (previous && previous.x === point.x && previous.y === point.y) continue;
    while (result.length >= 2) {
      const a = result.at(-2),
        b = result.at(-1);
      const ux = b.x - a.x,
        uy = b.y - a.y,
        vx = point.x - b.x,
        vy = point.y - b.y;
      if (Math.abs(ux * vy - uy * vx) > 1e-6 || ux * vx + uy * vy <= 0) break;
      result.pop();
    }
    result.push(point);
  }
  return result;
}
export function getVenueRoutePath(points, radius = 12) {
  const clean = simplifyVenueRoutePoints(points);
  if (!clean.length) return '';
  let d = `M${clean[0].x} ${clean[0].y}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const a = clean[i - 1],
      b = clean[i],
      c = clean[i + 1];
    const incoming = Math.hypot(b.x - a.x, b.y - a.y),
      outgoing = Math.hypot(c.x - b.x, c.y - b.y);
    const trim = Math.min(Math.max(0, radius), incoming / 2, outgoing / 2);
    if (!trim) continue;
    const enter = {
      x: b.x + ((a.x - b.x) * trim) / incoming,
      y: b.y + ((a.y - b.y) * trim) / incoming,
    };
    const leave = {
      x: b.x + ((c.x - b.x) * trim) / outgoing,
      y: b.y + ((c.y - b.y) * trim) / outgoing,
    };
    d += `L${enter.x} ${enter.y}Q${b.x} ${b.y} ${leave.x} ${leave.y}`;
  }
  const last = clean.at(-1);
  return clean.length > 1 ? `${d}L${last.x} ${last.y}` : d;
}
