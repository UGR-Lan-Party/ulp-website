import test from 'node:test';
import assert from 'node:assert/strict';
import { aularioEntrances, getAularioMapPoint } from '../src/data/aulario.ts';
import {
  venuePlans,
  getVenueLayout,
  campusPoint,
} from '../src/data/venue-map.ts';
import { findVenueRoute, routeLocations } from '../src/utils/venue-routing.js';
test('Hall to 1.2 leaves via the patio and reaches the right-hand main entrance in its exterior segment', () => {
  const route = findVenueRoute('hall', 'aulario-1.2');
  assert.deepEqual(
    route.segments.map((s) => s.plan),
    ['principal-0', 'recinto', 'aulario-0', 'aulario-1'],
  );
  const exterior = route.segments[1];
  assert.deepEqual(exterior.points[0], campusPoint(930, 580));
  assert.deepEqual(
    exterior.points.at(-1),
    campusPoint(aularioEntrances[0].campusX, aularioEntrances[0].campusY),
  );
  assert.deepEqual(exterior.points.slice(1), [
    campusPoint(896, 580),
    campusPoint(896, 945),
    campusPoint(896, 985),
  ]);
  assert.equal(exterior.arrival, 'Entrada principal del Aulario');
  assert.deepEqual(route.segments[2].points[0], getAularioMapPoint(0, 458, 0));
  assert.equal(route.segments[3].transition, 'stairs');
});
test('Aulario entrance callouts follow the real doors and the main one is on the right by default', () => {
  const points = getVenueLayout('aulario-0', 1),
    main = points.find((p) => p.id === 'aulario-entry'),
    aux = points.find((p) => p.id === 'aulario-aux-entry');
  assert.ok(main && aux);
  assert.ok(main.x > aux.x);
  for (const point of [main, aux]) {
    assert.equal(point.side, 'bottom');
    assert.ok(point.labelY > point.y);
    assert.equal(point.edgeX, point.x);
  }
  for (const entry of aularioEntrances) {
    assert.ok(routeLocations.some((loc) => loc.id === entry.id));
    assert.ok(findVenueRoute('hall', entry.id));
  }
});
test('No passage view or destination remains and benches are reached within Vista General', () => {
  assert.ok(venuePlans.every((p) => p.id !== 'pasillo-exterior'));
  assert.ok(routeLocations.every((loc) => loc.id !== 'pasillo-exterior'));
  assert.deepEqual(
    findVenueRoute('hall', 'bancos-rojos').segments.map((s) => s.plan),
    ['principal-0', 'recinto'],
  );
});

test('Routes from other buildings use the same main Aulario entrance', () => {
  for (const origin of [
    'hall',
    'grados',
    'estudiantes',
    'cafeteria',
    'ping-pong',
    'a1',
    'bancos-rojos',
  ]) {
    for (const level of [0, 1])
      for (let room = 1; room <= 8; room++) {
        const route = findVenueRoute(origin, `aulario-${level}.${room}`);
        assert.ok(route, `${origin} to ${level}.${room}`);
        const index = route.segments.findIndex((s) => s.plan === 'recinto');
        assert.ok(index >= 0);
        assert.deepEqual(
          route.segments[index].points.at(-1),
          campusPoint(896, 985),
        );
        assert.deepEqual(
          route.segments[index + 1].points[0],
          getAularioMapPoint(0, 458, 0),
        );
      }
  }
});
