import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVenueZones,
  venueZones,
  venuePlans,
  getVenueLayout,
} from '../src/data/venue-map.ts';

test('Las actividades de varias aulas señalan todas sus ubicaciones', () => {
  assert.deepEqual(getVenueZones('Prefabricadas A2 y B1.'), ['a2', 'b1']);
  assert.deepEqual(getVenueZones('Aulas -1.1 y -1.2.'), ['aula11', 'aula12']);
});
test('La cafetería y el espacio bajo ella son zonas distintas', () => {
  assert.deepEqual(getVenueZones('Cafetería ETSIIT.'), ['cafeteria']);
  assert.deepEqual(getVenueZones('Bajo de cafetería.'), ['bajo-cafeteria']);
});
test('Una sala no confirmada no recibe una posición inventada', () => {
  assert.deepEqual(getVenueZones('Sala de Profesores Externos.'), []);
  assert.deepEqual(getVenueZones('Entrada edificio principal.'), []);
  assert.ok(!venueZones.some((zone) => zone.id === 'entrada'));
  assert.equal(
    new Set(venueZones.map((zone) => zone.id)).size,
    venueZones.length,
  );
});

test('Cada zona pertenece a una planta existente y cada plano tiene geometría independiente', () => {
  assert.equal(new Set(venuePlans.map((plan) => plan.id)).size, 7);
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
          assert.equal(
            intersects(
              { x: point.edgeX, y: point.labelY + 20 },
              point,
              { x: other.edgeX, y: other.labelY + 20 },
              other,
            ),
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
  for (const floor of floors) assert.deepEqual(getVenueLayout(floor.id, 0), []);
  for (const location of ['Aula 0.1', 'Aula 1.1', 'Aula 2.1', 'Aula 3.1'])
    assert.deepEqual(getVenueZones(location), []);
});
