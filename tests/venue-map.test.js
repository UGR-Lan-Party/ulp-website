import { getVenueLeaderPath } from '../src/data/venue-leaders.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVenueZones,
  venueZones,
  venuePlans,
  selectableVenuePlans,
  campusPrefabs,
  campusPrefabScale,
  getCampusPrefabPoint,
  campusParking,
  getVenueLayout,
} from '../src/data/venue-map.ts';

test('Las actividades de varias aulas señalan todas sus ubicaciones', () => {
  assert.deepEqual(getVenueZones('Prefabricadas A2 y B1.'), ['a2', 'b1']);
  assert.deepEqual(getVenueZones('Aulas -1.1 y -1.2.'), ['aula11', 'aula12']);
});
test('La cafetería conserva su zona y la antigua etiqueta retirada no se remapea', () => {
  assert.deepEqual(getVenueZones('Cafetería ETSIIT.'), ['cafeteria']);
  assert.deepEqual(getVenueZones('Bajo de cafetería.'), []);
});
test('Las salas confirmadas reciben su ubicación y los accesos sin confirmar no se inventan', () => {
  assert.deepEqual(getVenueZones('Sala de Profesores Externos.'), [
    'profesores-externos',
  ]);
  assert.equal(
    venueZones.find((zone) => zone.id === 'profesores-externos').plan,
    'principal-baja',
  );
  assert.deepEqual(getVenueZones('Entrada edificio principal.'), []);
  assert.ok(!venueZones.some((zone) => zone.id === 'entrada'));
  assert.equal(
    new Set(venueZones.map((zone) => zone.id)).size,
    venueZones.length,
  );
});

test('Cada zona pertenece a una planta existente y cada plano tiene geometría independiente', () => {
  assert.equal(new Set(venuePlans.map((plan) => plan.id)).size, 14);
  assert.equal(selectableVenuePlans.length, 9);
  for (const plan of venuePlans.filter((plan) => 'parent' in plan))
    assert.ok(selectableVenuePlans.some((parent) => parent.id === plan.parent));
  for (const zone of venueZones)
    assert.ok(
      venuePlans.some((plan) => plan.id === zone.plan),
      zone.id,
    );
});

test('Las cuatro orientaciones mantienen los puntos dentro del plano y las líneas no se cruzan', () => {
  const cross = (a, b, c) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const intersects = (a, b, c, d) =>
    cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
  for (const plan of venuePlans) {
    for (const orientation of [0, 1, 2, 3]) {
      const layout = getVenueLayout(plan.id, orientation);
      for (const point of layout) {
        assert.ok(
          point.x >= 170 && point.x <= 750 && point.y >= 65 && point.y <= 635,
          `${plan.id}/${orientation}/${point.id}`,
        );
        for (const other of layout) {
          if (point.id === other.id) continue;
          const segments = (item) => [
            [
              { x: item.edgeX, y: item.edgeY },
              { x: item.x, y: item.edgeY },
            ],
            [{ x: item.x, y: item.edgeY }, item],
          ];
          for (const [a, b] of segments(point))
            for (const [c, d] of segments(other))
              assert.equal(
                intersects(a, b, c, d),
                false,
                `${plan.id}/${orientation}/${point.id}/${other.id}`,
              );
        }
      }
    }
  }
});

test('Las dos plantas del Aulario no están vinculadas a actividades históricas', () => {
  const floors = venuePlans.filter((plan) => plan.building === 'aulario');
  assert.deepEqual(
    floors.map((plan) => plan.floor),
    ['Planta 0', 'Planta 1'],
  );
  assert.deepEqual(
    getVenueLayout('aulario-0', 0)
      .map((point) => point.id)
      .sort(),
    ['aulario-aux-entry', 'aulario-entry'],
  );
  assert.deepEqual(getVenueLayout('aulario-1', 0), []);
  for (const location of ['Aula 0.1', 'Aula 1.1', 'Aula 2.1', 'Aula 3.1'])
    assert.deepEqual(getVenueZones(location), []);
});

test('Futbolín, ping pong y terraza tienen zonas exteriores independientes', () => {
  assert.deepEqual(getVenueZones('Bancos rojos (patio).'), ['bancos-rojos']);
  assert.deepEqual(getVenueZones('Bajo exterior entre edificios.'), [
    'bajo-exterior',
  ]);
  assert.deepEqual(getVenueZones('Terraza de cafetería'), ['terraza']);
  assert.equal(
    venueZones.find((zone) => zone.id === 'bancos-rojos').plan,
    'bancos-rojos',
  );
  assert.equal(
    venueZones.find((zone) => zone.id === 'bajo-exterior').plan,
    'bajo-exterior',
  );
  assert.equal(
    venueZones.find((zone) => zone.id === 'campus-pingpong').openPlan,
    'bajo-exterior',
  );
  assert.equal(
    venueZones.find((zone) => zone.id === 'terraza').plan,
    'recinto',
  );
});

test('Las prefabricadas permanecen separadas sobre un mismo eje', () => {
  const [a, b] = campusPrefabs;
  const angle = (28 * Math.PI) / 180;
  const transverseOffset =
    (b.x - a.x) * Math.cos(angle) + (b.y - a.y) * Math.sin(angle);
  assert.ok(Math.abs(transverseOffset) < 0.01);
  const longitudinalDistance =
    -(b.x - a.x) * Math.sin(angle) + (b.y - a.y) * Math.cos(angle);
  assert.ok(longitudinalDistance > 210);
});

test('Los indicadores conservan las líneas rectas y redondean los codos de las conexiones inclinadas', () => {
  assert.equal(
    getVenueLeaderPath({ x: 100, y: 80 }, { x: 200, y: 80 }),
    'M100 80L200 80',
  );
  assert.equal(
    getVenueLeaderPath({ x: 100, y: 80 }, { x: 100, y: 180 }),
    'M100 80L100 180',
  );
  assert.equal(
    getVenueLeaderPath({ x: 100, y: 80 }, { x: 200, y: 180 }),
    'M100 80L192 80Q200 80 200 88L200 180',
  );
  assert.equal(
    getVenueLeaderPath({ x: 100, y: 80 }, { x: 80, y: 60 }, true),
    'M100 80L100 68Q100 60 92 60L80 60',
  );
});

test('El borde del parking prolonga exactamente el lateral exterior de ambas prefabricadas ampliadas', () => {
  const a = { x: campusParking.leftTopX, y: campusParking.y };
  const b = {
    x: campusParking.leftBottomX,
    y: campusParking.y + campusParking.height,
  };
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  for (const module of campusPrefabs) {
    for (const y of [0, 210]) {
      const point = getCampusPrefabPoint(module.id, 0, y);
      const distance =
        ((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)) /
        length;
      assert.ok(Math.abs(distance) < 1e-8);
    }
  }
  assert.ok(campusPrefabScale > 1 && campusPrefabScale <= 1.15);
  assert.equal(campusParking.rightTopX, 475);
  assert.equal(campusParking.rightBottomX, 340);
  const gap = 266 - 210 * campusPrefabScale;
  assert.ok(gap > 30);
});
